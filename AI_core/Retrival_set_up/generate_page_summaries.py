"""
Claude-Powered Page Summary Generator
======================================

Generates detailed summaries for each page using Claude Sonnet 4.5.
Processes 10 pages at a time and creates structured JSON output.

Requirements:
    pip install anthropic --break-system-packages
"""

import json
import os
import re
from pathlib import Path
from typing import List, Dict, Tuple
import time
from datetime import datetime
from anthropic import Anthropic


class PageSummaryGenerator:
    """
    Generates AI-powered summaries for textbook pages.
    
    For each page, creates a 150-word summary covering:
    - Main content and topics
    - Unique information provided
    - Specific concepts and methods
    - Questions the page can answer
    """
    
    def __init__(
        self,
        combined_txt_path: str,
        output_dir: str = None,
        anthropic_api_key: str = None,
        batch_size: int = 10
    ):
        """
        Initialize the page summary generator.
        
        Args:
            combined_txt_path: Path to combined text file (from PDF parser)
            output_dir: Output directory for results
            anthropic_api_key: Anthropic API key (or set ANTHROPIC_API_KEY env variable)
            batch_size: Number of pages to process at once (default: 10)
        """
        self.combined_txt_path = Path(combined_txt_path)
        
        if not self.combined_txt_path.exists():
            raise FileNotFoundError(f"Combined text file not found: {combined_txt_path}")
        
        # Set output directory
        if output_dir:
            self.output_dir = Path(output_dir)
        else:
            self.output_dir = self.combined_txt_path.parent / "page_summaries"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize Anthropic client
        api_key = anthropic_api_key or os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("Anthropic API key required. Set ANTHROPIC_API_KEY or pass as parameter.")
        self.client = Anthropic(api_key=api_key)
        
        # Model configuration
        self.model = "claude-sonnet-4-5"
        self.batch_size = batch_size
        
        # Statistics
        self.stats = {
            'total_api_calls': 0,
            'total_input_tokens': 0,
            'total_output_tokens': 0,
            'start_time': time.time()
        }
        
        print(f"Initialized with model: {self.model}")
        print(f"Batch size: {self.batch_size} pages")
    
    def extract_pages_from_combined_txt(self) -> Dict[int, str]:
        """
        Extract individual pages from combined text file.
        
        Returns:
            Dict mapping page_number -> page_text
        """
        print("\nExtracting pages from combined text file...")
        
        with open(self.combined_txt_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Split by page markers
        page_pattern = r'={80}\nPAGE (\d+)\n={80}\n'
        splits = re.split(page_pattern, content)
        
        pages = {}
        # splits will be: ['', '1', 'text for page 1', '2', 'text for page 2', ...]
        for i in range(1, len(splits), 2):
            page_num = int(splits[i])
            page_text = splits[i + 1].strip() if i + 1 < len(splits) else ""
            
            # Remove image references section if present
            image_marker = '\n\n[Images on this page:'
            if image_marker in page_text:
                page_text = page_text[:page_text.index(image_marker)]
            
            pages[page_num] = page_text
        
        print(f"Extracted {len(pages)} pages")
        return pages
    
    def create_summary_prompt(self, pages_batch: List[Tuple[int, str]]) -> str:
        """
        Create a structured prompt for Claude to summarize multiple pages.
        
        Args:
            pages_batch: List of (page_number, page_text) tuples
            
        Returns:
            Formatted prompt string
        """
        prompt = """You are analyzing a research methods in psychology textbook. For each page provided, create a detailed 150-word summary.

REQUIREMENTS FOR EACH PAGE SUMMARY:
1. Main content: What topics, concepts, or methods are covered
2. Unique information: What specific, distinctive information does this page provide
3. Key concepts: List specific research terms, statistical methods, or psychological concepts
4. Questions it answers: What questions could a student answer using this page

OUTPUT FORMAT (CRITICAL - Must follow exactly):
For each page, output in this exact JSON structure:

```json
{
  "page_number": [PAGE_NUMBER],
  "summary": "[150-word summary covering all requirements above]",
  "main_topics": ["topic1", "topic2", "topic3"],
  "key_concepts": ["concept1", "concept2", "concept3"],
  "methods_discussed": ["method1", "method2"],
  "questions_answered": [
    "What is...",
    "How does...",
    "Why is..."
  ],
  "unique_information": "[What makes this page's content distinctive]"
}
```

IMPORTANT:
- Keep summary to EXACTLY 150 words or fewer
- Be specific and concrete
- Include technical terminology
- Focus on what makes each page unique
- Output valid JSON only

Here are the pages to analyze:

"""
        
        # Add each page
        for page_num, page_text in pages_batch:
            prompt += f"\n{'='*80}\nPAGE {page_num}\n{'='*80}\n{page_text[:3000]}\n"  # Limit to 3000 chars per page
        
        prompt += "\n\nNow provide the JSON summaries for each page above. Output ONLY valid JSON in the format specified."
        
        return prompt
    
    def call_claude(self, prompt: str, batch_info: str = "") -> str:
        """
        Call Claude API to generate summaries.
        
        Args:
            prompt: The prompt to send
            batch_info: Batch information for logging
            
        Returns:
            Claude's response text
        """
        try:
            print(f"  📤 Sending to Claude API... {batch_info}")
            
            response = self.client.messages.create(
                model=self.model,
                max_tokens=8000,
                temperature=0.3,  # Lower for more consistent output
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )
            
            # Update statistics
            self.stats['total_api_calls'] += 1
            self.stats['total_input_tokens'] += response.usage.input_tokens
            self.stats['total_output_tokens'] += response.usage.output_tokens
            
            # Calculate costs
            input_cost = response.usage.input_tokens / 1_000_000 * 3.0
            output_cost = response.usage.output_tokens / 1_000_000 * 15.0
            total_cost = input_cost + output_cost
            
            print(f"  📥 Received response")
            print(f"     Input tokens: {response.usage.input_tokens:,} | Output tokens: {response.usage.output_tokens:,}")
            print(f"     Cost this call: ${total_cost:.4f}")
            
            return response.content[0].text
        
        except Exception as e:
            print(f"  ❌ Error calling Claude API: {e}")
            raise
    
    def parse_claude_response(self, response: str, expected_pages: List[int]) -> List[Dict]:
        """
        Parse Claude's JSON response into structured summaries.
        
        Args:
            response: Claude's response text
            expected_pages: List of page numbers we expected
            
        Returns:
            List of page summary dictionaries
        """
        # Remove markdown code blocks if present
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        # Try to parse as JSON array
        try:
            # If it's wrapped in array brackets
            if response.startswith('['):
                summaries = json.loads(response)
            else:
                # Try to find JSON objects
                # Look for individual JSON objects
                json_objects = []
                depth = 0
                current_obj = ""
                in_string = False
                escape_next = False
                
                for char in response:
                    if escape_next:
                        current_obj += char
                        escape_next = False
                        continue
                    
                    if char == '\\':
                        escape_next = True
                        current_obj += char
                        continue
                    
                    if char == '"' and not escape_next:
                        in_string = not in_string
                    
                    if not in_string:
                        if char == '{':
                            if depth == 0:
                                current_obj = "{"
                            else:
                                current_obj += char
                            depth += 1
                        elif char == '}':
                            depth -= 1
                            current_obj += char
                            if depth == 0:
                                try:
                                    obj = json.loads(current_obj)
                                    json_objects.append(obj)
                                    current_obj = ""
                                except:
                                    pass
                        elif depth > 0:
                            current_obj += char
                    else:
                        current_obj += char
                
                summaries = json_objects
            
            # Validate we got all expected pages
            found_pages = {s['page_number'] for s in summaries}
            missing = set(expected_pages) - found_pages
            if missing:
                print(f"Warning: Missing summaries for pages: {missing}")
            
            return summaries
        
        except Exception as e:
            print(f"Error parsing Claude response: {e}")
            print(f"Response preview: {response[:500]}")
            return []
    
    def generate_summaries(self) -> Dict:
        """
        Generate summaries for all pages.
        
        Returns:
            Dictionary with all page summaries and metadata
        """
        print("="*80)
        print("GENERATING PAGE SUMMARIES WITH CLAUDE")
        print("="*80)
        print(f"Model: {self.model}")
        print(f"Batch size: {self.batch_size} pages per API call")
        print()
        
        # Extract pages
        pages = self.extract_pages_from_combined_txt()
        page_numbers = sorted(pages.keys())
        
        print(f"Total pages to process: {len(page_numbers)}")
        print("-" * 80)
        
        all_summaries = []
        
        # Process in batches
        for i in range(0, len(page_numbers), self.batch_size):
            batch_page_nums = page_numbers[i:i + self.batch_size]
            batch_pages = [(num, pages[num]) for num in batch_page_nums]
            
            batch_num = (i // self.batch_size) + 1
            total_batches = (len(page_numbers) + self.batch_size - 1) // self.batch_size
            
            print(f"\n{'='*80}")
            print(f"BATCH {batch_num}/{total_batches}")
            print(f"{'='*80}")
            print(f"Pages: {batch_page_nums[0]} to {batch_page_nums[-1]} ({len(batch_page_nums)} pages)")
            
            # Calculate cumulative stats
            cumulative_input = self.stats['total_input_tokens']
            cumulative_output = self.stats['total_output_tokens']
            cumulative_cost = (cumulative_input / 1_000_000 * 3.0) + (cumulative_output / 1_000_000 * 15.0)
            
            if batch_num > 1:
                print(f"Cumulative so far: {self.stats['total_api_calls']} calls | ${cumulative_cost:.2f} cost")
            
            # Create prompt
            print(f"  📝 Creating prompt for {len(batch_pages)} pages...")
            prompt = self.create_summary_prompt(batch_pages)
            
            # Call Claude
            batch_info = f"(Batch {batch_num}/{total_batches})"
            response = self.call_claude(prompt, batch_info)
            
            # Parse response
            print(f"  🔍 Parsing JSON response...")
            batch_summaries = self.parse_claude_response(response, batch_page_nums)
            
            if batch_summaries:
                all_summaries.extend(batch_summaries)
                print(f"  ✅ Successfully processed {len(batch_summaries)}/{len(batch_page_nums)} pages")
                
                # Show which pages were successfully processed
                parsed_pages = [s['page_number'] for s in batch_summaries]
                missing_pages = set(batch_page_nums) - set(parsed_pages)
                if missing_pages:
                    print(f"  ⚠️  Warning: Missing pages {sorted(missing_pages)}")
                
                # INCREMENTAL SAVE - Save progress after each batch
                print(f"  💾 Saving progress...")
                temp_output = {
                    'metadata': {
                        'source_file': str(self.combined_txt_path.name),
                        'model': self.model,
                        'batch_size': self.batch_size,
                        'total_pages': len(page_numbers),
                        'generation_date': datetime.now().isoformat(),
                        'status': 'IN_PROGRESS'
                    },
                    'processing_stats': {
                        'total_api_calls': self.stats['total_api_calls'],
                        'total_input_tokens': self.stats['total_input_tokens'],
                        'total_output_tokens': self.stats['total_output_tokens'],
                        'processing_time_seconds': round(time.time() - self.stats['start_time'], 2)
                    },
                    'page_summaries': sorted(all_summaries, key=lambda x: x['page_number'])
                }
                
                temp_path = self.output_dir / 'page_summaries_claude_TEMP.json'
                with open(temp_path, 'w', encoding='utf-8') as f:
                    json.dump(temp_output, f, indent=2, ensure_ascii=False)
                
            else:
                print(f"  ❌ Failed to parse summaries for this batch")
            
            # Progress summary
            elapsed = time.time() - self.stats['start_time']
            pages_done = len(all_summaries)
            pages_remaining = len(page_numbers) - pages_done
            
            if pages_done > 0:
                avg_time_per_page = elapsed / pages_done
                estimated_remaining = avg_time_per_page * pages_remaining
                
                print(f"\n  📊 Progress: {pages_done}/{len(page_numbers)} pages complete")
                print(f"     Time elapsed: {elapsed/60:.1f} min | Estimated remaining: {estimated_remaining/60:.1f} min")
            
            # Small delay to avoid rate limits
            if i + self.batch_size < len(page_numbers):
                print(f"  ⏸  Waiting 1 second before next batch...")
                time.sleep(1)
        
        # Create final structure
        processing_time = time.time() - self.stats['start_time']
        
        final_output = {
            'metadata': {
                'source_file': str(self.combined_txt_path.name),
                'model': self.model,
                'batch_size': self.batch_size,
                'total_pages': len(page_numbers),
                'generation_date': datetime.now().isoformat(),
                'status': 'COMPLETE'
            },
            'processing_stats': {
                'total_api_calls': self.stats['total_api_calls'],
                'total_input_tokens': self.stats['total_input_tokens'],
                'total_output_tokens': self.stats['total_output_tokens'],
                'processing_time_seconds': round(processing_time, 2)
            },
            'page_summaries': sorted(all_summaries, key=lambda x: x['page_number'])
        }
        
        return final_output
    
    def save_summaries(self, summaries: Dict):
        """
        Save summaries to JSON file.
        
        Args:
            summaries: Dictionary with all summaries
        """
        # Mark as complete
        summaries['metadata']['status'] = 'COMPLETE'
        
        output_path = self.output_dir / 'page_summaries_claude.json'
        
        print(f"\nSaving final summaries to: {output_path}")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(summaries, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Saved: {output_path.name}")
        print(f"  File size: {output_path.stat().st_size / 1024:.2f} KB")
        
        # Remove temp file if it exists
        temp_path = self.output_dir / 'page_summaries_claude_TEMP.json'
        if temp_path.exists():
            temp_path.unlink()
            print(f"  Removed temporary file: {temp_path.name}")
    
    def run(self):
        """
        Run the complete pipeline.
        
        Returns:
            Dictionary with all summaries
        """
        try:
            # Generate summaries
            summaries = self.generate_summaries()
            
            # Save to file
            self.save_summaries(summaries)
            
            # Print summary
            print("\n" + "="*80)
            print("PROCESSING COMPLETE!")
            print("="*80)
            
            # Calculate costs
            input_cost = self.stats['total_input_tokens'] / 1_000_000 * 3.0
            output_cost = self.stats['total_output_tokens'] / 1_000_000 * 15.0
            total_cost = input_cost + output_cost
            
            print(f"\n📊 Statistics:")
            print(f"  Total pages: {summaries['metadata']['total_pages']}")
            print(f"  Summaries generated: {len(summaries['page_summaries'])}")
            print(f"  Success rate: {len(summaries['page_summaries'])/summaries['metadata']['total_pages']*100:.1f}%")
            
            print(f"\n💰 Cost Breakdown:")
            print(f"  API calls: {self.stats['total_api_calls']}")
            print(f"  Input tokens: {self.stats['total_input_tokens']:,} (${input_cost:.4f})")
            print(f"  Output tokens: {self.stats['total_output_tokens']:,} (${output_cost:.4f})")
            print(f"  Total cost: ${total_cost:.2f}")
            
            print(f"\n⏱️  Performance:")
            print(f"  Processing time: {summaries['processing_stats']['processing_time_seconds']:.1f}s ({summaries['processing_stats']['processing_time_seconds']/60:.1f} min)")
            print(f"  Average per page: {summaries['processing_stats']['processing_time_seconds']/len(summaries['page_summaries']):.2f}s")
            print(f"  Average per batch: {summaries['processing_stats']['processing_time_seconds']/self.stats['total_api_calls']:.1f}s")
            
            print(f"\n📁 Output: {self.output_dir}/page_summaries_claude.json")
            print("="*80)
            
            return summaries
        
        except Exception as e:
            print(f"\nError during processing: {e}")
            import traceback
            traceback.print_exc()
            raise


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Generate page summaries using Claude Sonnet 4'
    )
    parser.add_argument(
        'combined_txt',
        help='Path to combined text file'
    )
    parser.add_argument(
        '--output-dir', '-o',
        help='Output directory',
        default=None
    )
    parser.add_argument(
        '--api-key',
        help='Anthropic API key (or set ANTHROPIC_API_KEY env variable)',
        default=None
    )
    parser.add_argument(
        '--batch-size', '-b',
        help='Number of pages per API call (default: 10)',
        type=int,
        default=10
    )
    
    args = parser.parse_args()
    
    try:
        generator = PageSummaryGenerator(
            args.combined_txt,
            output_dir=args.output_dir,
            anthropic_api_key=args.api_key,
            batch_size=args.batch_size
        )
        
        generator.run()
        
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())