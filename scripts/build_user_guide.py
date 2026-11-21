"""Build the illustrated offline installation guide."""

import json
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor


root = Path(__file__).resolve().parents[1]
version = json.loads((root / "manifest.json").read_text(encoding="utf-8"))["version"]
release = root / "release"
shots = release / "guide-screenshots"
output = release / f"icrebill_checkoutfill-线下试用使用说明-v{version}.docx"

doc = Document()
section = doc.sections[0]
section.top_margin = Cm(1.7)
section.bottom_margin = Cm(1.6)
section.left_margin = Cm(1.8)
section.right_margin = Cm(1.8)

styles = doc.styles
for name in ["Normal", "Title", "Heading 1", "Heading 2", "Caption"]:
    style = styles[name]
    style.font.name = "Microsoft YaHei"
    style._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
styles["Normal"].font.size = Pt(10.5)
styles["Normal"].paragraph_format.space_after = Pt(6)
styles["Normal"].paragraph_format.line_spacing = 1.26
styles["Title"].font.size = Pt(22)
styles["Title"].font.color.rgb = RGBColor(0, 0, 0)
styles["Title"].paragraph_format.space_after = Pt(12)
title_ppr = styles["Title"]._element.get_or_add_pPr()
for border in title_ppr.findall(qn("w:pBdr")):
    title_ppr.remove(border)
styles["Heading 1"].font.size = Pt(14)
styles["Heading 1"].paragraph_format.space_before = Pt(12)
styles["Heading 1"].paragraph_format.space_after = Pt(6)
styles["Caption"].font.size = Pt(9)
styles["Caption"].paragraph_format.space_after = Pt(10)


def paragraph(text, style=None):
    return doc.add_paragraph(text, style)


def step(number, text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.65)
    p.paragraph_format.first_line_indent = Cm(-0.65)
    p.add_run(f"{number}. ").bold = True
    p.add_run(text)
    return p


def shot(name, caption):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(2)
    p.add_run().add_picture(str(shots / name), width=Cm(16.5))
    c = paragraph(caption, "Caption")
    c.alignment = WD_ALIGN_PARAGRAPH.CENTER


title = doc.add_paragraph(style="Title")
title_run = title.add_run("icrebill_checkoutfill 使用说明")
title_run.font.color.rgb = RGBColor(0, 0, 0)
title_borders = OxmlElement("w:pBdr")
bottom_border = OxmlElement("w:bottom")
bottom_border.set(qn("w:val"), "nil")
title_borders.append(bottom_border)
title._element.get_or_add_pPr().append(title_borders)
paragraph(f"本说明适用于 v{version} 线下试用版。按下面的步骤在桌面版 Chrome 中安装，然后在自己的测试 checkout 页面手动生成并填入测试资料。插件不会自动提交订单或付款。")
doc.add_heading("准备安装包", 1)
paragraph(f"收到 icrebill_checkoutfill-v{version}-offline.zip 后，先完整解压到电脑上固定的位置，例如“文档”文件夹。解压后应看到 icrebill_checkoutfill-v{version} 文件夹；打开该文件夹，最外层应直接有 manifest.json。安装后不要移动或删除这个文件夹。")
doc.add_heading("在 Chrome 中安装", 1)
step(1, "在地址栏输入 chrome://extensions 并按回车。")
step(2, "打开页面右上角的“开发者模式”。")
step(3, f"点击“加载已解压的扩展程序”，选择刚解压的 icrebill_checkoutfill-v{version} 文件夹。")
step(4, "确认扩展程序列表出现 icrebill_checkoutfill。")
shot("01-extensions.png", "图 1  Chrome 扩展程序页面。打开开发者模式后，左上角会出现“加载已解压的扩展程序”。")
paragraph("注意：不要在 Chrome 中直接打开 ZIP，也不要双击 CRX 文件安装。")

doc.add_page_break()
doc.add_heading("在 checkout 页面生成资料", 1)
step(1, "打开自己要测试的 checkout 页面。网址中应包含 checkout。首次安装后，请先刷新该页面。")
step(2, "页面右侧会显示“生成资料”按钮。插件弹窗中可查看隐私说明。")
step(3, "点击“生成资料”。插件会填写识别到的邮箱、姓名、美国地址和电话。需要另一组资料时，再点一次。")
shot("02-checkout-before.png", "图 2  checkout 演示页面。点击右侧“生成资料”按钮前，表单仍为空。实际店铺的布局可能不同。")
paragraph("如果是分步骤 checkout，请在联系信息、收货地址或付款页面各自点击按钮。插件会在同一标签页的步骤之间沿用当前测试资料。")

doc.add_page_break()
doc.add_heading("检查填写结果", 1)
shot("03-checkout-after.png", "图 3  演示页面的填写效果。姓名、邮箱、地址、州、邮编和美国电话号码已出现在对应字段中。图中内容仅用于示意。")
paragraph("默认国家为美国，州为 California。当前内置地址库位于加州旧金山；如果在配置中选了其他州，街道、城市和 ZIP Code 需要自己填写。邮箱只是测试格式，不保证能收到邮件。")
doc.add_heading("配置和使用提醒", 1)
paragraph("点击 Chrome 工具栏中的插件图标，可以修改国家、州和测试卡设置。内置 4242、5555 和标注 3DS 的卡号均为 Stripe 官方测试卡，须在 Stripe 测试环境中使用；其他支付服务请使用其官方测试卡及测试环境。姓名、地址等表单填写不限定 Stripe。插件不会点击提交订单或付款按钮。")
doc.add_heading("遇到问题时", 1)
paragraph("没有看到按钮：确认网址包含 checkout，并刷新页面。无痕窗口中，还需要到 chrome://extensions 的插件详情里开启“在无痕模式下允许”。")
paragraph("个别字段没有填入：页面控件可能需要手动选择，例如电话区号应为美国 +1。请检查表单内容后再继续测试。")
paragraph("更新试用版：将新版本文件覆盖到原来加载的文件夹，在 chrome://extensions 点击该插件的“重新加载”，然后刷新 checkout 页面。")

doc.save(output)
print(output)
