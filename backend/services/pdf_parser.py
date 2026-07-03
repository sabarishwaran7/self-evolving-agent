import io
import PyPDF2
import docx

class DocumentParserService:
    @staticmethod
    def extract_text_from_file(file_content: bytes, filename: str) -> str:
        """Extract text from PDF or DOCX binary content."""
        ext = filename.lower().split('.')[-1]
        text = ""
        
        try:
            if ext == "pdf":
                reader = PyPDF2.PdfReader(io.BytesIO(file_content))
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            elif ext == "docx":
                doc = docx.Document(io.BytesIO(file_content))
                for para in doc.paragraphs:
                    text += para.text + "\n"
            elif ext == "txt":
                text = file_content.decode("utf-8")
        except Exception as e:
            print(f"Failed to parse file {filename}: {e}")
            
        return text
