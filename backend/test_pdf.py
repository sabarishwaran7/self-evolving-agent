import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, FrameBreak, NextPageTemplate
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch

def test_pdf():
    filepath = "test_output.pdf"
    doc = BaseDocTemplate(
        filepath,
        pagesize=letter,
        rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36
    )
    
    frame_width = (doc.width - 18) / 2
    top_height = 3.0 * inch
    body_height = doc.height - top_height
    
    frame_top = Frame(doc.leftMargin, doc.bottomMargin + body_height, doc.width, top_height, id='top', showBoundary=1)
    frame_col1_first = Frame(doc.leftMargin, doc.bottomMargin, frame_width, body_height, id='col1_first', showBoundary=1)
    frame_col2_first = Frame(doc.leftMargin + frame_width + 18, doc.bottomMargin, frame_width, body_height, id='col2_first', showBoundary=1)
    
    frame_col1 = Frame(doc.leftMargin, doc.bottomMargin, frame_width, doc.height, id='col1', showBoundary=1)
    frame_col2 = Frame(doc.leftMargin + frame_width + 18, doc.bottomMargin, frame_width, doc.height, id='col2', showBoundary=1)
    
    doc.addPageTemplates([
        PageTemplate(id='FirstPage', frames=[frame_top, frame_col1_first, frame_col2_first]),
        PageTemplate(id='TwoCol', frames=[frame_col1, frame_col2])
    ])
    
    story = []
    story.append(NextPageTemplate('TwoCol'))
    
    title_style = ParagraphStyle(name='Title', fontSize=16, alignment=1)
    body_style = ParagraphStyle(name='Body', fontSize=10, alignment=4)
    
    story.append(Paragraph("This is the Title", title_style))
    story.append(Paragraph("Authors and Institution", title_style))
    story.append(Paragraph("Abstract: " + "This is a very long abstract. " * 20, body_style))
    
    story.append(FrameBreak())
    
    for i in range(10):
        story.append(Paragraph(f"Heading {i}", title_style))
        story.append(Paragraph("Body text. " * 50, body_style))
        
    doc.build(story)
    print("PDF generated successfully.")

if __name__ == "__main__":
    test_pdf()
