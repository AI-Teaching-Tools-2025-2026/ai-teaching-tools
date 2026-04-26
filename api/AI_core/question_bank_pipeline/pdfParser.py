from pypdf import PdfReader

# Define constants for identifying just chapters
SKIP_SECTIONS_START = ["Preface"]
SKIP_SECTIONS_END = ["Glossary", "Appendix", "Answer Key", "Index", "References"]

################################################################################
#   CODE CITATION - readOutline()
#   Author: Mathieu Fenniak and pypdf contributors
#   Link: https://pypdf.readthedocs.io/en/stable/user/handling-outlines.html#reading-simple-outlines 
#   Date: 04/25/2026
#   Notes: Adapted the example code from "Reading Simple Outlines" documentation
################################################################################
def readOutline(reader, chapterData, textbookLastPage):
    foundPreface = False
    tempChapters = []  # First pass: Collect chapters with start pages
    endSectionStart = None  # Track the first ending section (Glossary, Index, etc.)

    for outline in reader.outline:
        # Check if item is a list (which represents nested children)
        if isinstance(outline, list):
            continue  # Skip over nested parts (e.g., sub-sections of a chapter)

        # Skip over introduction sections and look for "Preface" since this precedes first chapter
        if outline.title in SKIP_SECTIONS_START:
            if outline.title == "Preface":
                foundPreface = True
            continue

        if outline.title in SKIP_SECTIONS_END:
            # Record the first ending section's start page
            if endSectionStart is None:
                endSectionStart = reader.get_destination_page_number(outline)
            continue  # Always skip ending sections

        pageNum = reader.get_destination_page_number(outline)

        if foundPreface and pageNum is not None:
            tempChapters.append(
                {
                    "chapterTitle": outline.title,
                    "startPage": pageNum,
                }
            )

    # Second pass: Calculate end pages
    for i, chapter in enumerate(tempChapters):
        if i + 1 < len(tempChapters):
            # End page is the next chapter's start page - 1
            endPage = tempChapters[i + 1]["startPage"] - 1
        elif endSectionStart is not None:
            # Last chapter ends at the page before the first ending section
            endPage = endSectionStart - 1
        else:
            # Fallback to end of textbook if no ending section found
            endPage = textbookLastPage

        chapterData.append(
            {
                "chapterTitle": chapter["chapterTitle"],
                "startPage": chapter["startPage"],
                "endPage": endPage,
            }
        )


if __name__ == "__main__":
    # Set up reader for textbook 
    # TODO: Update this so that we can grab the user's uploaded textbook rather than just specifying a file path
    reader = PdfReader("researchTextbook.pdf")

    if reader is None:
        exit()

    # Set up variables for readOutline()
    chapterData = []    # This will be a list of dictionaries
    textbookLastPage = reader.get_num_pages()   # This is a fallback if a ending page cannot be found

    # Updates chapterData to have dictionaries for each chapter
    readOutline(reader, chapterData, textbookLastPage)

    for i, chapter in enumerate(chapterData):
        # Print statement that can be commented out eventually
        print(
            f"Chapter {i + 1}: {chapter["chapterTitle"]}; Pages {chapter["startPage"]} - {chapter["endPage"]}"
        )

        # TEMPORARY STUFF; WILL NEED TO REFACTOR FOR PROD 
        outputDir = "newTextbookChapters"
        # Open a new txt file for extracting text of chapter
        filename = f"{outputDir}/chapter_{i+1}.txt"
        f = open(filename, "w", encoding="utf-8")

        # Actual extraction as per https://pypdf.readthedocs.io/en/stable/user/extract-text.html 
        for i in range(chapter["startPage"], chapter["endPage"]):
            page = reader.pages[i]
            f.write(page.extract_text())
        
        f.close()

    # TODO: Write chapter textual data into MongoDB

    reader.close()