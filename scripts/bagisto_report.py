#!/usr/bin/env python3
"""
Bagisto Project Analysis Report Generator
Generates a comprehensive PDF report analyzing the Bagisto e-commerce framework.
"""

import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether, ListFlowable, ListItem
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ─── Font Registration ───
FONT_DIR = '/usr/share/fonts'
pdfmetrics.registerFont(TTFont('NotoSerifSC', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Light', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Light.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-SemiBold', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-SemiBold.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Black', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Black.ttf'))
pdfmetrics.registerFont(TTFont('NotoSansSC', f'{FONT_DIR}/truetype/chinese/SarasaMonoSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSansSC-Bold', f'{FONT_DIR}/truetype/chinese/SarasaMonoSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', f'{FONT_DIR}/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', f'{FONT_DIR}/truetype/dejavu/DejaVuSans-Bold.ttf'))

registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSC-Bold',
                    italic='NotoSerifSC-Light')
registerFontFamily('NotoSansSC', normal='NotoSansSC', bold='NotoSansSC-Bold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans-Bold')

# ─── Palette (Cascade V2) ───
PAGE_BG       = colors.HexColor('#f1f1f0')
SECTION_BG    = colors.HexColor('#efeeed')
CARD_BG       = colors.HexColor('#eae9e6')
TABLE_STRIPE  = colors.HexColor('#edece9')
HEADER_FILL   = colors.HexColor('#786e50')
COVER_BLOCK   = colors.HexColor('#6a6351')
BORDER        = colors.HexColor('#cbc6b7')
ICON          = colors.HexColor('#887335')
ACCENT        = colors.HexColor('#8c7226')
ACCENT_2      = colors.HexColor('#512eb7')
TEXT_PRIMARY   = colors.HexColor('#161514')
TEXT_MUTED     = colors.HexColor('#7a7871')
SEM_SUCCESS   = colors.HexColor('#39794e')
SEM_WARNING   = colors.HexColor('#ad8e4e')
SEM_ERROR     = colors.HexColor('#984942')
SEM_INFO      = colors.HexColor('#56799c')

# ─── Page Setup ───
PAGE_W, PAGE_H = A4
LEFT_MARGIN = 2.2 * cm
RIGHT_MARGIN = 2.2 * cm
TOP_MARGIN = 2.5 * cm
BOTTOM_MARGIN = 2.5 * cm
CONTENT_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN

# ─── Styles ───
styles = getSampleStyleSheet()

style_title = ParagraphStyle(
    'ReportTitle', parent=styles['Title'],
    fontName='NotoSerifSC-Bold', fontSize=26, leading=34,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER,
    spaceAfter=8*mm
)

style_h1 = ParagraphStyle(
    'H1Arabic', parent=styles['Heading1'],
    fontName='NotoSerifSC-Bold', fontSize=18, leading=26,
    textColor=HEADER_FILL, spaceBefore=10*mm, spaceAfter=5*mm,
    borderWidth=0, borderPadding=0,
)

style_h2 = ParagraphStyle(
    'H2Arabic', parent=styles['Heading2'],
    fontName='NotoSerifSC-SemiBold', fontSize=14, leading=20,
    textColor=ACCENT, spaceBefore=6*mm, spaceAfter=3*mm,
)

style_h3 = ParagraphStyle(
    'H3Arabic', parent=styles['Heading3'],
    fontName='NotoSerifSC-Bold', fontSize=12, leading=17,
    textColor=COVER_BLOCK, spaceBefore=4*mm, spaceAfter=2*mm,
)

style_body = ParagraphStyle(
    'BodyArabic', parent=styles['Normal'],
    fontName='NotoSerifSC', fontSize=10.5, leading=18,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT,
    spaceBefore=1.5*mm, spaceAfter=1.5*mm,
)

style_body_muted = ParagraphStyle(
    'BodyMuted', parent=style_body,
    textColor=TEXT_MUTED, fontSize=9.5, leading=16,
)

style_table_header = ParagraphStyle(
    'TableHeader', parent=styles['Normal'],
    fontName='NotoSansSC-Bold', fontSize=9.5, leading=14,
    textColor=colors.white, alignment=TA_CENTER,
)

style_table_cell = ParagraphStyle(
    'TableCell', parent=styles['Normal'],
    fontName='NotoSansSC', fontSize=9, leading=13,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER,
)

style_table_cell_left = ParagraphStyle(
    'TableCellLeft', parent=style_table_cell,
    alignment=TA_LEFT,
)

style_bullet = ParagraphStyle(
    'BulletArabic', parent=style_body,
    fontName='NotoSerifSC', fontSize=10.5, leading=17,
    leftIndent=12*mm, bulletIndent=6*mm,
    spaceBefore=1*mm, spaceAfter=1*mm,
)

style_kicker = ParagraphStyle(
    'Kicker', parent=styles['Normal'],
    fontName='NotoSerifSC-Light', fontSize=12, leading=16,
    textColor=TEXT_MUTED, alignment=TA_CENTER,
    spaceAfter=3*mm,
)

style_cover_subtitle = ParagraphStyle(
    'CoverSubtitle', parent=styles['Normal'],
    fontName='NotoSerifSC', fontSize=14, leading=22,
    textColor=TEXT_MUTED, alignment=TA_CENTER,
    spaceAfter=5*mm,
)

style_cover_meta = ParagraphStyle(
    'CoverMeta', parent=styles['Normal'],
    fontName='NotoSerifSC-Light', fontSize=11, leading=16,
    textColor=TEXT_MUTED, alignment=TA_CENTER,
)

style_stat_number = ParagraphStyle(
    'StatNumber', parent=styles['Normal'],
    fontName='NotoSerifSC-Bold', fontSize=22, leading=28,
    textColor=ACCENT, alignment=TA_CENTER,
)

style_stat_label = ParagraphStyle(
    'StatLabel', parent=styles['Normal'],
    fontName='NotoSerifSC-Light', fontSize=9, leading=13,
    textColor=TEXT_MUTED, alignment=TA_CENTER,
)


# ─── Helper Functions ───
def make_heading_with_line(text, style=style_h1):
    """Create a heading with a decorative line below."""
    elements = []
    elements.append(Paragraph(text, style))
    # Decorative line
    line_data = [['', '']]
    line_table = Table(line_data, colWidths=[CONTENT_W * 0.3, CONTENT_W * 0.7])
    line_table.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (0, 0), 2, ACCENT),
        ('LINEBELOW', (1, 0), (1, 0), 0.5, BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(line_table)
    return elements

def make_stat_block(stats):
    """Create a row of stat cards. stats = [(number, label), ...]"""
    cells = []
    for num, label in stats:
        cell_content = [
            Paragraph(str(num), style_stat_number),
            Paragraph(label, style_stat_label),
        ]
        cells.append(cell_content)

    col_w = CONTENT_W / len(stats)
    data = [cells]
    table = Table(data, colWidths=[col_w] * len(stats))
    table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('TOPPADDING', (0, 0), (-1, -1), 4*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4*mm),
    ]))
    return table

def make_info_table(data_pairs, col_widths=None):
    """Create a key-value info table. data_pairs = [(key, value), ...]"""
    if col_widths is None:
        col_widths = [CONTENT_W * 0.35, CONTENT_W * 0.65]

    table_data = []
    for key, value in data_pairs:
        table_data.append([
            Paragraph(str(key), style_table_cell_left),
            Paragraph(str(value), style_table_cell_left),
        ])

    table = Table(table_data, colWidths=col_widths)
    style_cmds = [
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 3*mm),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3*mm),
        ('BACKGROUND', (0, 0), (0, -1), TABLE_STRIPE),
    ]
    # Alternate row background
    for i in range(len(table_data)):
        if i % 2 == 1:
            style_cmds.append(('BACKGROUND', (1, i), (1, i), TABLE_STRIPE))
    table.setStyle(TableStyle(style_cmds))
    return table

def make_data_table(headers, rows, col_widths=None):
    """Create a data table with header row."""
    if col_widths is None:
        col_widths = [CONTENT_W / len(headers)] * len(headers)

    table_data = []
    # Header
    header_row = [Paragraph(h, style_table_header) for h in headers]
    table_data.append(header_row)
    # Data rows
    for row in rows:
        table_data.append([Paragraph(str(c), style_table_cell_left) for c in row])

    table = Table(table_data, colWidths=col_widths)
    style_cmds = [
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 2*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 2*mm),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2*mm),
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ]
    for i in range(1, len(table_data)):
        if i % 2 == 0:
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), TABLE_STRIPE))
    table.setStyle(TableStyle(style_cmds))
    return table

def bullet_list(items):
    """Create bullet list items."""
    elements = []
    for item in items:
        elements.append(Paragraph(item, style_bullet, bulletText='\u2022'))
    return elements


# ─── Build Document ───
output_path = '/home/z/my-project/download/Bagisto_Project_Report.pdf'
os.makedirs(os.path.dirname(output_path), exist_ok=True)

# ─── Page Number Callback ───
def add_page_number(canvas, doc):
    """Add page number to footer on all pages except the first (cover)."""
    page_num = canvas.getPageNumber()
    if page_num > 1:  # Skip cover page
        canvas.saveState()
        canvas.setFont('NotoSerifSC-Light', 9)
        canvas.setFillColor(TEXT_MUTED)
        canvas.drawCentredString(PAGE_W / 2, BOTTOM_MARGIN - 8*mm, f'{page_num}')
        canvas.restoreState()

doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=LEFT_MARGIN,
    rightMargin=RIGHT_MARGIN,
    topMargin=TOP_MARGIN,
    bottomMargin=BOTTOM_MARGIN,
    title='Bagisto Project Analysis Report',
    author='Z.ai',
    creator='Z.ai',
    subject='Comprehensive analysis of the Bagisto Laravel e-commerce framework',
)

story = []

# ═══════════════════════════════════════════
# COVER PAGE
# ═══════════════════════════════════════════
story.append(Spacer(1, 30*mm))

# Kicker
story.append(Paragraph('PROJECT ANALYSIS REPORT', style_kicker))
story.append(Spacer(1, 5*mm))

# Main Title
story.append(Paragraph('Bagisto', style_title))
story.append(Paragraph('Laravel E-Commerce Framework', ParagraphStyle(
    'SubTitle', parent=style_title, fontSize=16, leading=22,
    textColor=ACCENT, fontName='NotoSerifSC-SemiBold',
)))
story.append(Spacer(1, 10*mm))

# Summary block
summary_style = ParagraphStyle(
    'CoverSummary', parent=style_body,
    fontSize=11, leading=18, alignment=TA_CENTER,
    textColor=TEXT_MUTED,
)
story.append(Paragraph(
    'A comprehensive technical analysis of the Bagisto open-source Laravel e-commerce framework, '
    'covering architecture, modules, dependencies, codebase metrics, and deployment readiness assessment.',
    summary_style
))
story.append(Spacer(1, 15*mm))

# Decorative line
line_data = [['', '']]
line_table = Table(line_data, colWidths=[CONTENT_W * 0.2, CONTENT_W * 0.6])
line_table.setStyle(TableStyle([
    ('LINEBELOW', (0, 0), (0, 0), 2, ACCENT),
    ('LINEBELOW', (1, 0), (1, 0), 0.5, BORDER),
    ('TOPPADDING', (0, 0), (-1, -1), 0),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
]))
story.append(line_table)
story.append(Spacer(1, 10*mm))

# Meta info
story.append(Paragraph('Repository: github.com/bagisto/bagisto', style_cover_meta))
story.append(Paragraph('Latest Version: v2.4.6 (June 5, 2026)', style_cover_meta))
story.append(Paragraph('License: MIT', style_cover_meta))
story.append(Paragraph('Report Date: June 20, 2026', style_cover_meta))

story.append(PageBreak())

# ═══════════════════════════════════════════
# TABLE OF CONTENTS
# ═══════════════════════════════════════════
story.append(Paragraph('Table of Contents', style_h1))
story.append(Spacer(1, 5*mm))

toc_items = [
    ('1', 'Executive Summary'),
    ('2', 'Project Overview'),
    ('3', 'Technical Architecture'),
    ('4', 'Module Analysis'),
    ('5', 'Codebase Metrics'),
    ('6', 'Dependencies & Requirements'),
    ('7', 'Deployment Assessment'),
    ('8', 'Security & Compliance'),
    ('9', 'Recommendations'),
]

toc_style_num = ParagraphStyle('TOCNum', parent=style_body, fontName='NotoSerifSC-Bold',
                                fontSize=11, textColor=ACCENT, alignment=TA_RIGHT)
toc_style_text = ParagraphStyle('TOCText', parent=style_body, fontSize=11, leading=18)

toc_data = []
for num, text in toc_items:
    toc_data.append([
        Paragraph(num, toc_style_num),
        Paragraph(text, toc_style_text),
    ])

toc_table = Table(toc_data, colWidths=[CONTENT_W * 0.08, CONTENT_W * 0.92])
toc_table.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 2*mm),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 2*mm),
    ('LINEBELOW', (0, 0), (-1, -1), 0.3, BORDER),
]))
story.append(toc_table)

story.append(PageBreak())

# ═══════════════════════════════════════════
# 1. EXECUTIVE SUMMARY
# ═══════════════════════════════════════════
story.extend(make_heading_with_line('1. Executive Summary'))

story.append(Paragraph(
    'Bagisto is a comprehensive, open-source Laravel-based e-commerce framework that provides a robust foundation '
    'for building online stores and marketplaces. The project leverages modern web technologies including Laravel 12, '
    'Vue.js, and Vite, and follows a modular architecture pattern with over 40 independent packages. This report '
    'presents a thorough analysis of the Bagisto codebase, covering its architecture, modules, dependencies, '
    'code quality metrics, and deployment readiness.',
    style_body
))

story.append(Paragraph(
    'The framework is designed to serve a wide range of e-commerce needs, from single-vendor shops to multi-vendor '
    'marketplaces, B2B commerce platforms, and headless commerce solutions. It supports multiple payment gateways '
    'including Stripe, PayPal, Razorpay, PayU, and PhonePe, and includes advanced features such as booking products, '
    'RMA (Return Merchandise Authorization), GDPR compliance, and AI-powered content generation through its MagicAI module. '
    'The project is actively maintained with regular releases, the latest being v2.4.6 released on June 5, 2026.',
    style_body
))

story.append(Spacer(1, 5*mm))

# Stats block
stats = make_stat_block([
    ('40+', 'Modules'),
    ('474K+', 'PHP LOC'),
    ('2,434', 'PHP Files'),
    ('551', 'Blade Templates'),
    ('v2.4.6', 'Latest Version'),
])
story.append(stats)

story.append(Spacer(1, 5*mm))

# ═══════════════════════════════════════════
# 2. PROJECT OVERVIEW
# ═══════════════════════════════════════════
story.extend(make_heading_with_line('2. Project Overview'))

story.append(Paragraph(
    'Bagisto positions itself as a developer-friendly, modular e-commerce framework built on top of the Laravel PHP framework. '
    'Unlike monolithic e-commerce platforms, Bagisto adopts a package-based architecture where each functional domain '
    '(products, orders, customers, payments, etc.) is implemented as an independent Laravel package under the Webkul namespace. '
    'This design choice enables developers to selectively enable or disable features, extend functionality through package overrides, '
    'and maintain a clean separation of concerns across the entire application.',
    style_body
))

story.append(Paragraph(
    'The project is licensed under the MIT license, making it fully open-source and free for commercial use. '
    'It has a vibrant community with active contributions on GitHub, a dedicated forum, and a Facebook community group. '
    'The framework supports over 20 languages including Arabic, Chinese, English, French, German, Japanese, and Russian, '
    'making it suitable for global e-commerce deployments. The official documentation is available at devdocs.bagisto.com, '
    'and a live demo is accessible at demo.bagisto.com for quick evaluation.',
    style_body
))

story.append(Spacer(1, 3*mm))
story.append(Paragraph('Key Project Information', style_h2))

story.append(make_info_table([
    ('Project Name', 'Bagisto'),
    ('Repository', 'github.com/bagisto/bagisto'),
    ('Description', 'Laravel E-Commerce Framework'),
    ('License', 'MIT'),
    ('Latest Version', 'v2.4.6 (June 5, 2026)'),
    ('PHP Requirement', 'PHP 8.3+'),
    ('Framework', 'Laravel 12'),
    ('Frontend', 'Vue.js + Vite 6'),
    ('Database', 'MySQL 8.0'),
    ('Cache', 'Redis (Predis)'),
    ('Search', 'Elasticsearch 7.17'),
    ('Total Size', '502 MB (with git history)'),
    ('Supported Languages', '20+ including Arabic, Chinese, English'),
]))

# ═══════════════════════════════════════════
# 3. TECHNICAL ARCHITECTURE
# ═══════════════════════════════════════════
story.extend(make_heading_with_line('3. Technical Architecture'))

story.append(Paragraph(
    'Bagisto follows a modular monolith architecture, where the entire application is deployed as a single unit, '
    'but internally organized as a collection of independent packages. This approach combines the operational simplicity '
    'of a monolithic deployment with the code organization benefits of a modular system. Each package is self-contained '
    'with its own models, repositories, controllers, views, migrations, and service providers, following the Laravel '
    'convention of modular package development.',
    style_body
))

story.append(Paragraph(
    'The architecture relies heavily on the Laravel service provider pattern for package registration and bootstrapping. '
    'Each module registers its own routes, views, configurations, and event listeners through dedicated service providers. '
    'The Konekt Concord package is used as the module management layer, providing a standardized way to discover and '
    'register modules. Additionally, the Astrotomic Laravel Translatable package enables multi-language support at the '
    'model level, allowing product descriptions, category names, and other translatable content to be stored and retrieved '
    'in multiple languages seamlessly.',
    style_body
))

story.append(Paragraph('Architecture Layers', style_h2))

story.append(make_data_table(
    ['Layer', 'Technology', 'Description'],
    [
        ['Frontend', 'Vue.js + Vite 6', 'Reactive UI components and asset bundling'],
        ['Template Engine', 'Blade (551 files)', 'Server-side rendering for admin and shop views'],
        ['Application Layer', 'Laravel 12', 'MVC framework, service providers, middleware'],
        ['Module System', 'Konekt Concord', 'Package discovery and registration'],
        ['Data Layer', 'Eloquent ORM', 'Active Record pattern with repository abstraction'],
        ['Data Grid', 'Custom DataGrid', 'Server-side data tables with filtering and export'],
        ['Cache Layer', 'Redis + FPC', 'Full Page Cache with event-based invalidation'],
        ['Search Engine', 'Elasticsearch 7.17', 'Full-text search with Kibana dashboard'],
        ['Queue System', 'Laravel Queue', 'Async job processing for imports, indexing, emails'],
        ['Authentication', 'Sanctum + Socialite', 'Token-based auth and social login'],
    ],
    col_widths=[CONTENT_W * 0.18, CONTENT_W * 0.27, CONTENT_W * 0.55]
))

story.append(Spacer(1, 4*mm))

story.append(Paragraph('Docker Infrastructure', style_h2))
story.append(Paragraph(
    'Bagisto provides a comprehensive Docker Compose configuration for local development using Laravel Sail. '
    'The Docker setup includes the following services: a PHP 8.3 application server, MySQL 8.0 database, '
    'Redis cache, Elasticsearch 7.17 with Kibana for search and analytics, and Mailpit for email testing. '
    'This containerized environment ensures consistency across development machines and simplifies the onboarding '
    'process for new contributors. The Elasticsearch instance is configured with 256MB heap size and single-node '
    'discovery mode, suitable for development but requiring tuning for production deployments.',
    style_body
))

# ═══════════════════════════════════════════
# 4. MODULE ANALYSIS
# ═══════════════════════════════════════════
story.extend(make_heading_with_line('4. Module Analysis'))

story.append(Paragraph(
    'The Bagisto framework is composed of 40 independent packages organized under the Webkul namespace. '
    'Each package follows a consistent internal structure with src/, tests/, and resources/ directories. '
    'The packages are designed around domain-driven design principles, where each package encapsulates a specific '
    'business domain with its own data models, business logic, and presentation layer. This modular approach '
    'allows developers to customize or replace individual packages without affecting the rest of the system.',
    style_body
))

story.append(Paragraph('Core Modules', style_h2))

story.append(make_data_table(
    ['Module', 'Purpose', 'Key Features'],
    [
        ['Admin', 'Admin panel', 'Dashboard, CRUD operations, configuration management (553 PHP files)'],
        ['Shop', 'Storefront', 'Customer-facing catalog, checkout, product pages (329 PHP files)'],
        ['Core', 'Foundation', 'Base classes, helpers, channel management (171 PHP files)'],
        ['Product', 'Product management', 'Simple, configurable, grouped, bundle, downloadable types'],
        ['Category', 'Category management', 'Nested set tree (kalno/nestedset), translations'],
        ['Customer', 'Customer accounts', 'Registration, auth, wishlist, compare, groups, VAT validation'],
        ['Sales', 'Order management', 'Orders, invoices, shipments, refunds'],
        ['Checkout', 'Cart & checkout', 'Multi-step checkout, address management, cart rules'],
        ['Inventory', 'Stock management', 'Inventory sources, multi-warehouse tracking'],
        ['Payment', 'Payment abstraction', 'Base payment interface, COD, money transfer'],
    ],
    col_widths=[CONTENT_W * 0.15, CONTENT_W * 0.22, CONTENT_W * 0.63]
))

story.append(Spacer(1, 4*mm))

story.append(Paragraph('Payment Gateways', style_h2))
story.append(Paragraph(
    'Bagisto integrates with multiple payment providers through a standardized payment interface. Each payment gateway '
    'is implemented as a separate package, allowing for easy addition or removal of payment methods. The payment packages '
    'include Stripe (using the official stripe-php SDK v17.3), PayPal (via PayPal Server SDK v2.0), Razorpay (for the '
    'Indian market), PayU (another Indian payment gateway), and PhonePe (UPI-based payments). All payment packages follow '
    'a consistent pattern with dedicated controllers, configuration files, and localized language files supporting over '
    '15 languages each. The CashOnDelivery and MoneyTransfer methods are provided as built-in offline payment options.',
    style_body
))

story.append(Paragraph('Marketing & SEO Modules', style_h2))
story.append(Paragraph(
    'The framework includes comprehensive marketing and SEO tools. The CartRule module provides discount and coupon '
    'management with support for percentage and fixed-amount discounts, coupon code generation, and usage limits. '
    'The CatalogRule module enables automated price rules based on conditions such as customer groups, channels, '
    'and product attributes. The Marketing package consolidates promotional tools, while the Sitemap module generates '
    'XML sitemaps for search engine optimization. The SocialLogin package enables authentication via social media '
    'platforms, and SocialShare adds sharing buttons for products across social networks.',
    style_body
))

story.append(Paragraph('Advanced Features', style_h2))

story.append(make_data_table(
    ['Module', 'Description'],
    [
        ['MagicAI', 'AI-powered content generation supporting OpenAI, Gemini, Anthropic, Mistral, Ollama, Groq, DeepSeek, and xAI models'],
        ['BookingProduct', 'Booking system with appointment, event, rental, default, and table slot types'],
        ['RMA', 'Return Merchandise Authorization with custom fields, status tracking, and resolution management'],
        ['GDPR', 'GDPR compliance with data request management and consent tracking'],
        ['EUWithdrawal', 'EU withdrawal directive compliance (Directive 2023/2673)'],
        ['DataTransfer', 'Data import/export with batch processing and job queues'],
        ['DataGrid', 'Custom data grid component with filtering, sorting, export, and saved filters'],
        ['FPC', 'Full Page Cache with event-driven invalidation for products, categories, and CMS pages'],
        ['Theme', 'Multi-theme support with theme customization and translation management'],
        ['Notification', 'Order notification system with event-driven updates'],
    ],
    col_widths=[CONTENT_W * 0.20, CONTENT_W * 0.80]
))

# ═══════════════════════════════════════════
# 5. CODEBASE METRICS
# ═══════════════════════════════════════════
story.extend(make_heading_with_line('5. Codebase Metrics'))

story.append(Paragraph(
    'The Bagisto codebase is substantial, reflecting the comprehensive nature of the e-commerce framework. '
    'With over 474,000 lines of PHP code across 2,434 files, the project represents a significant development effort. '
    'The codebase also includes 551 Blade template files for server-side rendering, 87 JavaScript files for frontend '
    'interactivity, and 31 CSS files for styling. The project does not use Vue single-file components (.vue files), '
    'instead relying on Blade templates combined with vanilla JavaScript for most of the frontend logic.',
    style_body
))

story.append(Paragraph('File Distribution', style_h2))

story.append(make_data_table(
    ['File Type', 'Count', 'Description'],
    [
        ['PHP Files', '2,434', 'Core application logic, models, controllers, repositories'],
        ['Blade Templates', '551', 'Server-side views for admin panel and storefront'],
        ['JavaScript Files', '87', 'Frontend interactivity and AJAX handlers'],
        ['CSS Files', '31', 'Stylesheets for admin and shop themes'],
        ['Migration Files', '100+', 'Database schema definitions and updates'],
        ['Language Files', '300+', 'Translation files for 20+ languages'],
    ],
    col_widths=[CONTENT_W * 0.20, CONTENT_W * 0.12, CONTENT_W * 0.68]
))

story.append(Spacer(1, 4*mm))

story.append(Paragraph('Lines of Code by Package', style_h2))
story.append(Paragraph(
    'The largest packages by code volume are the Admin panel (553 PHP files) and the Shop storefront (329 PHP files), '
    'which together account for a significant portion of the total codebase. The Core package (171 PHP files) provides '
    'the foundational classes and interfaces that other packages depend on. The Product module is one of the most complex, '
    'supporting multiple product types including simple, configurable, grouped, bundle, downloadable, virtual, and booking '
    'products. Each product type has its own set of models, repositories, controllers, and views, contributing to the '
    'overall code volume.',
    style_body
))

story.append(Paragraph('Top Packages by PHP File Count', style_h3))

story.append(make_data_table(
    ['Package', 'PHP Files', 'Primary Responsibility'],
    [
        ['Admin', '553', 'Backend administration panel with all management interfaces'],
        ['Shop', '329', 'Customer-facing storefront with catalog and checkout'],
        ['Core', '171', 'Framework foundation, base classes, and shared utilities'],
        ['Product', '~150', 'Multi-type product management system'],
        ['Sales', '~120', 'Order processing, invoicing, and refund management'],
        ['Customer', '~100', 'Customer accounts, authentication, and group management'],
        ['Checkout', '~90', 'Shopping cart and multi-step checkout flow'],
        ['BookingProduct', '~80', 'Booking system with 5 sub-types'],
    ],
    col_widths=[CONTENT_W * 0.20, CONTENT_W * 0.13, CONTENT_W * 0.67]
))

# ═══════════════════════════════════════════
# 6. DEPENDENCIES & REQUIREMENTS
# ═══════════════════════════════════════════
story.extend(make_heading_with_line('6. Dependencies & Requirements'))

story.append(Paragraph(
    'Bagisto has a comprehensive dependency graph that reflects its enterprise-grade feature set. The project requires '
    'PHP 8.3 or higher, which is a relatively modern requirement that ensures access to the latest language features '
    'including readonly properties, enums, and fiber support. The framework is built on Laravel 12, the latest major '
    'version of the Laravel framework, which itself introduces significant improvements in performance, developer '
    'experience, and ecosystem integration.',
    style_body
))

story.append(Paragraph('Server Requirements', style_h2))

story.append(make_data_table(
    ['Requirement', 'Minimum Version', 'Purpose'],
    [
        ['PHP', '8.3+', 'Runtime environment'],
        ['ext-calendar', '*', 'Date and calendar functions'],
        ['ext-curl', '*', 'HTTP client operations'],
        ['ext-intl', '*', 'Internationalization support'],
        ['ext-mbstring', '*', 'Multibyte string handling'],
        ['ext-openssl', '*', 'Encryption and HTTPS'],
        ['ext-pdo', '*', 'Database abstraction layer'],
        ['ext-pdo_mysql', '*', 'MySQL PDO driver'],
        ['ext-tokenizer', '*', 'PHP code parsing'],
        ['MySQL', '8.0+', 'Primary database'],
        ['Redis', '*', 'Cache and session storage'],
        ['Elasticsearch', '7.17+', 'Full-text search engine'],
        ['Node.js', '18+', 'Frontend asset compilation'],
    ],
    col_widths=[CONTENT_W * 0.20, CONTENT_W * 0.18, CONTENT_W * 0.62]
))

story.append(Spacer(1, 4*mm))

story.append(Paragraph('Key Composer Dependencies', style_h2))

story.append(make_data_table(
    ['Package', 'Version', 'Role'],
    [
        ['laravel/framework', '^12.0', 'Core PHP framework (MVC, ORM, Queue, etc.)'],
        ['laravel/sanctum', '^4.0', 'API token authentication'],
        ['laravel/socialite', '^5.0', 'OAuth social login providers'],
        ['laravel/cashier', '^16.0', 'Stripe billing subscriptions'],
        ['laravel/octane', '^2.3', 'High-performance application server'],
        ['laravel/ai', '^0.2.2', 'AI integration for MagicAI module'],
        ['elasticsearch/elasticsearch', '^8.10', 'Elasticsearch PHP client'],
        ['predis/predis', '^2.2', 'Redis client for PHP'],
        ['maatwebsite/excel', '^3.1.46', 'Excel import/export'],
        ['intervention/image', '^2.4|^3.0', 'Image manipulation and processing'],
        ['barryvdh/laravel-dompdf', '^2.0|^3.0', 'PDF generation from HTML'],
        ['mpdf/mpdf', '^8.2', 'Alternative PDF generation engine'],
        ['stripe/stripe-php', '^17.3', 'Stripe payment SDK'],
        ['paypal/paypal-server-sdk', '^2.0', 'PayPal payment SDK'],
        ['razorpay/razorpay', '^2.9', 'Razorpay payment SDK'],
        ['astrotomic/laravel-translatable', '^11.16', 'Multi-language model translations'],
        ['konekt/concord', '^1.16', 'Module management system'],
        ['kalnoy/nestedset', '^6.0', 'Nested set for category trees'],
        ['spatie/laravel-responsecache', '^7.4', 'HTTP response caching'],
        ['spatie/laravel-sitemap', '^7.3', 'XML sitemap generation'],
        ['khaled.alshamaa/ar-php', '^6.0.0', 'Arabic language processing support'],
    ],
    col_widths=[CONTENT_W * 0.30, CONTENT_W * 0.13, CONTENT_W * 0.57]
))

story.append(Spacer(1, 4*mm))

story.append(Paragraph('Development Dependencies', style_h2))
story.append(Paragraph(
    'The development tooling includes PHPUnit 11 and Pest 3 for testing, Laravel Pint for code formatting, '
    'PHPStan via Laravel Boost for static analysis, and Laravel Debugbar for development profiling. The project also '
    'includes Playwright for end-to-end browser testing, indicating a commitment to comprehensive testing coverage. '
    'The bagisto/laravel-datafaker package provides fake data generation for testing and development purposes.',
    style_body
))

# ═══════════════════════════════════════════
# 7. DEPLOYMENT ASSESSMENT
# ═══════════════════════════════════════════
story.extend(make_heading_with_line('7. Deployment Assessment'))

story.append(Paragraph(
    'Deploying Bagisto requires careful planning due to its multiple service dependencies and the need for proper '
    'environment configuration. The framework relies on several backend services that must be properly configured '
    'and interconnected: a MySQL 8.0 database, Redis cache server, and Elasticsearch cluster. Each of these services '
    'requires specific configuration parameters and resource allocations to ensure optimal performance.',
    style_body
))

story.append(Paragraph('Deployment Methods', style_h2))
story.append(Paragraph(
    'Bagisto supports multiple deployment approaches to accommodate different hosting environments and team preferences. '
    'The primary method is the traditional Composer-based installation, where developers clone the repository, install '
    'PHP dependencies via Composer, configure the .env file, run database migrations, and compile frontend assets using '
    'Vite. The project also provides a GUI installer that simplifies the initial setup process for less technical users, '
    'walking them through database configuration, admin account creation, and basic store settings.',
    style_body
))

story.append(Paragraph(
    'For containerized deployments, the included Docker Compose file provides a complete development environment with '
    'all required services. The Docker setup uses Laravel Sail as the base image, which is well-documented and widely '
    'adopted in the Laravel ecosystem. For production deployments on cloud infrastructure, Bagisto offers a pre-configured '
    'Amazon Machine Image (AMI) on the AWS Marketplace, enabling rapid deployment on EC2 instances without manual setup. '
    'This AMI includes all necessary software pre-installed and pre-configured, making it ideal for teams that want to '
    'get started quickly on a scalable cloud environment.',
    style_body
))

story.append(Paragraph('Deployment Readiness Checklist', style_h2))

checklist_data = [
    ('PHP 8.3+ Runtime', 'Required', SEM_ERROR),
    ('MySQL 8.0 Database', 'Required', SEM_ERROR),
    ('Redis Cache Server', 'Required', SEM_ERROR),
    ('Elasticsearch 7.17+', 'Required', SEM_ERROR),
    ('Node.js 18+ (build time)', 'Required', SEM_ERROR),
    ('Composer 2+', 'Required', SEM_ERROR),
    ('.env Configuration', 'Required', SEM_ERROR),
    ('Storage Permissions', 'Required', SEM_ERROR),
    ('SSL Certificate', 'Recommended', SEM_WARNING),
    ('Queue Worker (Supervisor)', 'Recommended', SEM_WARNING),
    ('Kibana Dashboard', 'Optional', SEM_INFO),
    ('Mailpit (development)', 'Optional', SEM_INFO),
]

checklist_table_data = [[
    Paragraph('Component', style_table_header),
    Paragraph('Status', style_table_header),
    Paragraph('Priority', style_table_header),
]]
for comp, status, priority_color in checklist_data:
    status_style = ParagraphStyle('StatusCell', parent=style_table_cell,
                                   textColor=priority_color, fontName='NotoSansSC-Bold')
    checklist_table_data.append([
        Paragraph(comp, style_table_cell_left),
        Paragraph(status, status_style),
        Paragraph('Required' if priority_color == SEM_ERROR else ('Recommended' if priority_color == SEM_WARNING else 'Optional'),
                  style_table_cell),
    ])

checklist_table = Table(checklist_table_data, colWidths=[CONTENT_W * 0.45, CONTENT_W * 0.20, CONTENT_W * 0.35])
checklist_style_cmds = [
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER),
    ('TOPPADDING', (0, 0), (-1, -1), 2*mm),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 2*mm),
    ('LEFTPADDING', (0, 0), (-1, -1), 2*mm),
    ('RIGHTPADDING', (0, 0), (-1, -1), 2*mm),
    ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
]
for i in range(1, len(checklist_table_data)):
    if i % 2 == 0:
        checklist_style_cmds.append(('BACKGROUND', (0, i), (-1, i), TABLE_STRIPE))
checklist_table.setStyle(TableStyle(checklist_style_cmds))
story.append(checklist_table)

story.append(Spacer(1, 5*mm))

story.append(Paragraph('Environment Limitation', style_h2))
story.append(Paragraph(
    'During our analysis, we attempted to run the project locally but encountered a significant limitation: PHP and '
    'Composer are not installed in the current analysis environment. Additionally, Docker is also unavailable, which '
    'prevented us from using the containerized deployment method. Node.js v24.16.0 and npm 11.13.0 are available, '
    'but these alone are insufficient to install and run the Bagisto application, which primarily requires a PHP runtime. '
    'This means that while we were able to perform a thorough static analysis of the codebase, we could not execute the '
    'application to verify runtime behavior, test functionality, or assess actual performance characteristics.',
    style_body
))

# ═══════════════════════════════════════════
# 8. SECURITY & COMPLIANCE
# ═══════════════════════════════════════════
story.extend(make_heading_with_line('8. Security & Compliance'))

story.append(Paragraph(
    'Security is a critical concern for any e-commerce platform that handles sensitive customer data, payment information, '
    'and business transactions. Bagisto incorporates several security measures and compliance features that address the '
    'most common security requirements for e-commerce applications. The project has a dedicated SECURITY.md file and '
    'encourages responsible disclosure of security vulnerabilities through a private reporting channel '
    '(support@bagisto.com) rather than public issue tracking.',
    style_body
))

story.append(Paragraph('Built-in Security Features', style_h2))

story.extend(bullet_list([
    '<b>Laravel Sanctum</b>: Token-based API authentication with CSRF protection for SPA and mobile clients',
    '<b>Laravel Socialite</b>: Secure OAuth-based social login with support for major providers',
    '<b>Stevebauman/Purify</b>: HTML input sanitization using HTML Purifier to prevent XSS attacks',
    '<b>Enshrined/SVG-Sanitize</b>: SVG file sanitization to prevent XML-based attacks when uploading SVG images',
    '<b>PragmaRX/Google2FA</b>: Two-factor authentication support for admin accounts',
    '<b>SSL/HTTPS</b>: OpenSSL extension required for encrypted communications',
    '<b>Rate Limiting</b>: Built-in Laravel rate limiting for API endpoints and form submissions',
]))

story.append(Spacer(1, 3*mm))

story.append(Paragraph('Compliance Modules', style_h2))

story.append(Paragraph(
    'Bagisto includes dedicated modules for regulatory compliance. The GDPR module provides data request management '
    'and consent tracking, enabling store owners to comply with the European General Data Protection Regulation. '
    'Customers can submit data access and deletion requests through a self-service interface, and administrators can '
    'manage these requests through a dedicated admin panel. The EUWithdrawal module, added in version 2.4.5, implements '
    'compliance with Directive (EU) 2023/2673 (Article 11a CRD), allowing customers and guests to withdraw from '
    'contracts online via a dedicated button on order pages. This module includes durable-medium confirmation emails, '
    'an admin datagrid with timeline view for managing withdrawals, and per-channel enable toggle. The inclusion of the '
    'khaled.alshamaa/ar-php package specifically for Arabic language processing demonstrates the project\'s commitment '
    'to supporting RTL (right-to-left) languages and Middle Eastern markets.',
    style_body
))

story.append(Paragraph('Security Considerations', style_h2))
story.append(Paragraph(
    'While Bagisto provides a solid security foundation, there are several areas that require attention during deployment. '
    'The project uses the Laravel response cache, which can potentially serve stale content if not properly invalidated. '
    'The FPC (Full Page Cache) module mitigates this by implementing event-based cache invalidation triggered by product '
    'updates, category changes, and other content modifications. Additionally, the Elasticsearch instance in the Docker '
    'configuration has security disabled (xpack.security.enabled=false), which is acceptable for development but must '
    'be properly secured for production. The MySQL configuration also allows empty passwords in the Docker setup, which '
    'should never be used in a production environment.',
    style_body
))

# ═══════════════════════════════════════════
# 9. RECOMMENDATIONS
# ═══════════════════════════════════════════
story.extend(make_heading_with_line('9. Recommendations'))

story.append(Paragraph(
    'Based on our comprehensive analysis of the Bagisto framework, we provide the following recommendations for teams '
    'considering adopting, deploying, or contributing to the project. These recommendations are organized by priority '
    'and cover deployment, security, performance, and development best practices.',
    style_body
))

story.append(Paragraph('High Priority Recommendations', style_h2))

story.extend(bullet_list([
    '<b>Use Docker for Development</b>: The Docker Compose setup provides all required services (MySQL, Redis, '
    'Elasticsearch) in a consistent environment. This eliminates the common "works on my machine" issues and '
    'significantly reduces onboarding time for new developers. Ensure Docker has at least 4GB of RAM allocated, '
    'as Elasticsearch requires substantial memory for indexing operations.',

    '<b>Secure Elasticsearch for Production</b>: The default Docker configuration disables Elasticsearch security '
    '(xpack.security.enabled=false). Before deploying to production, enable X-Pack security, configure TLS, set up '
    'authentication, and restrict network access to the Elasticsearch port. Consider using a dedicated Elasticsearch '
    'cluster with proper node sizing based on your product catalog size and search traffic.',

    '<b>Configure Queue Workers</b>: Bagisto uses Laravel queues for data imports, catalog rule indexing, and email '
    'sending. Configure a queue worker with Supervisor to ensure reliable background processing. Use the Redis driver '
    'for queues (already configured via Predis) for better performance compared to the database driver.',

    '<b>Set Up SSL/TLS</b>: E-commerce platforms must encrypt all data in transit. Obtain an SSL certificate from a '
    'trusted Certificate Authority (Let\'s Encrypt provides free certificates) and configure your web server to enforce '
    'HTTPS connections. The OpenSSL PHP extension is already required by Bagisto.',
]))

story.append(Spacer(1, 3*mm))

story.append(Paragraph('Medium Priority Recommendations', style_h2))

story.extend(bullet_list([
    '<b>Implement Caching Strategy</b>: Leverage the built-in FPC module and configure Redis caching for sessions, '
    'queries, and route caching. The Spatie ResponseCache package is already included; configure it with appropriate '
    'cache lifetimes and exclusion rules for dynamic pages like cart and checkout.',

    '<b>Set Up Monitoring</b>: Implement application performance monitoring using tools like Laravel Telescope (for '
    'development), New Relic, or Datadog (for production). Monitor queue worker health, Elasticsearch index status, '
    'Redis memory usage, and MySQL query performance. Set up alerts for error rate thresholds and response time degradation.',

    '<b>Review Payment Configuration</b>: Each payment gateway requires specific API credentials and configuration. '
    'Test all payment flows in sandbox/test mode before going live. Ensure webhook URLs are properly configured for '
    'payment confirmation callbacks. Consider implementing idempotency keys for payment requests to prevent duplicate charges.',

    '<b>Optimize Elasticsearch</b>: Configure custom analyzers and mappings for your product data to improve search '
    'relevance. Set up index lifecycle management to handle index growth. Consider implementing search suggestions '
    'and faceted navigation for better user experience.',
]))

story.append(Spacer(1, 3*mm))

story.append(Paragraph('Low Priority Recommendations', style_h2))

story.extend(bullet_list([
    '<b>Explore Headless Commerce</b>: Bagisto supports headless commerce through its API, and there is an official '
    'Next.js commerce storefront (github.com/bagisto/nextjs-commerce). Consider this approach if you need a highly '
    'customized frontend or want to serve multiple client applications (web, mobile, IoT) from a single backend.',

    '<b>Leverage MagicAI for Content</b>: The MagicAI module supports multiple LLM providers for automated product '
    'description generation, customer support chatbots, and search enhancement. Start with OpenAI integration for '
    'product descriptions, then expand to other use cases as you gain experience with the AI capabilities.',

    '<b>Consider Multi-Vendor Marketplace</b>: If your business model involves multiple sellers, evaluate the official '
    'Multi Vendor Marketplace extension, which adds seller management, commission tracking, and product approval workflows '
    'to the core Bagisto platform.',

    '<b>Mobile Commerce</b>: Bagisto offers an open-source Flutter mobile app (github.com/bagisto/opensource-ecommerce-mobile-app) '
    'that connects to the same backend API. Evaluate this option if mobile commerce is a priority for your target market.',
]))


# ═══════════════════════════════════════════
# BUILD PDF
# ═══════════════════════════════════════════
doc.build(story, onFirstPage=lambda c, d: None, onLaterPages=add_page_number)

print(f"Report generated successfully: {output_path}")

# Get file size
size = os.path.getsize(output_path)
print(f"File size: {size / 1024:.1f} KB")
