from pydantic import BaseModel


class TextbookMeta(BaseModel):
    """Metadata stored in the ``textbooks`` collection."""
    textbookId: str          # deterministic hash of the PDF, e.g. "TB_a3f8c901e2b4"
    filename: str            # original upload filename
    title: str = ""          # human-friendly title (can be set later)
    totalChapters: int = 0   # filled in after chapter extraction
    sha256: str = ""         # full hex digest for dedup
