import xml.etree.ElementTree as ET
from xml.dom import minidom
import html

def generate_moodle_xml(quiz_title, questions):
    """
    Chuyển đổi danh sách câu hỏi sang định dạng Moodle XML.
    """
    root = ET.Element("quiz")

    # Thêm Category (Tên bộ đề)
    question_cat = ET.SubElement(root, "question", type="category")
    category = ET.SubElement(question_cat, "category")
    text_cat = ET.SubElement(category, "text")
    text_cat.text = f"$course$/top/{quiz_title}"

    for q in questions:
        # Xác định loại câu hỏi
        q_type = "multichoice" if q.get("question_type") == "multiple_choice" else "truefalse"
        
        question = ET.SubElement(root, "question", type=q_type)
        
        # Tên câu hỏi (Dùng 1 phần văn bản câu hỏi)
        name = ET.SubElement(question, "name")
        name_text = ET.SubElement(name, "text")
        name_text.text = q.get("question_text", "")[:50] + "..."

        # Nội dung câu hỏi
        questiontext = ET.SubElement(question, "questiontext", format="html")
        text_q = ET.SubElement(questiontext, "text")
        # Thêm nhãn Cấp độ nhận thức vào nội dung câu hỏi để giảng viên dễ theo dõi
        cog_label = f"[{q.get('cognitive_level', 'RECALL')}] "
        text_q.text = f"<![CDATA[<p>{cog_label}{q.get('question_text')}</p>]]>"

        # General Feedback (Giải thích)
        if q.get("explanation"):
            genfeed = ET.SubElement(question, "generalfeedback", format="html")
            text_feed = ET.SubElement(genfeed, "text")
            text_feed.text = f"<![CDATA[<p>{q.get('explanation')}</p>]]>"

        # Điểm mặc định
        defaultgrade = ET.SubElement(question, "defaultgrade")
        defaultgrade.text = "1.0000000"

        # Phạt
        penalty = ET.SubElement(question, "penalty")
        penalty.text = "0.3333333"

        # Ẩn ID
        hidden = ET.SubElement(question, "hidden")
        hidden.text = "0"

        # Idnumber
        idnumber = ET.SubElement(question, "idnumber")
        idnumber.text = ""

        if q_type == "multichoice":
            # Cấu hình Trắc nghiệm
            single = ET.SubElement(question, "single")
            single.text = "true" # Chỉ có 1 đáp án đúng
            shuffleanswers = ET.SubElement(question, "shuffleanswers")
            shuffleanswers.text = "true"
            answernumbering = ET.SubElement(question, "answernumbering")
            answernumbering.text = "abc"
            showstandardinstruction = ET.SubElement(question, "showstandardinstruction")
            showstandardinstruction.text = "0"

        # Các lựa chọn đáp án
        for opt in q.get("options", []):
            fraction = "100" if opt.get("is_correct") else "0"
            answer = ET.SubElement(question, "answer", fraction=fraction, format="html")
            text_ans = ET.SubElement(answer, "text")
            text_ans.text = f"<![CDATA[<p>{opt.get('option_text')}</p>]]>"
            
            # Feedback cho từng đáp án (Nếu có logic distractor)
            feedback = ET.SubElement(answer, "feedback", format="html")
            text_fb = ET.SubElement(feedback, "text")
            if opt.get("distractor_logic"):
                text_fb.text = f"<![CDATA[<p>{opt.get('distractor_logic')}</p>]]>"
            else:
                text_fb.text = f"<![CDATA[<p>{'Chính xác!' if opt.get('is_correct') else 'Chưa chính xác.'}</p>]]>"

    # Chuyển đổi sang chuỗi XML đẹp (Pretty print)
    xml_str = ET.tostring(root, encoding='utf-8')
    parsed_xml = minidom.parseString(xml_str)
    
    # Moodle XML yêu cầu CDATA không được bị escaped, nên ta dùng cách thủ công để giữ CDATA
    return parsed_xml.toprettyxml(indent="  ", encoding="UTF-8").decode("utf-8")
