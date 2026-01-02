"""
PDF Export Service

Service pour générer des rapports PDF pour les assessments.
Utilise WeasyPrint pour la génération de PDF à partir de HTML/CSS.
"""

from typing import Dict, Any
from datetime import datetime
from io import BytesIO
import os

try:
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False


def generate_assessment_pdf(
    assessment_type: str,
    results: Dict[str, Any],
    user_name: str,
    user_email: str
) -> BytesIO:
    """
    Génère un PDF pour un assessment.
    
    Args:
        assessment_type: Type d'assessment ('tki', 'wellness', '360_self', 'mbti')
        results: Résultats de l'assessment
        user_name: Nom de l'utilisateur
        user_email: Email de l'utilisateur
        
    Returns:
        BytesIO contenant le PDF
    """
    if not WEASYPRINT_AVAILABLE:
        raise ImportError("WeasyPrint is not installed. Install with: pip install weasyprint")
    
    # Générer le HTML selon le type d'assessment
    if assessment_type == 'tki':
        html_content = generate_tki_html(results, user_name, user_email)
    elif assessment_type == 'wellness':
        html_content = generate_wellness_html(results, user_name, user_email)
    elif assessment_type == '360_self':
        html_content = generate_360_html(results, user_name, user_email)
    elif assessment_type == 'mbti':
        html_content = generate_mbti_html(results, user_name, user_email)
    else:
        raise ValueError(f"Unknown assessment type: {assessment_type}")
    
    # CSS commun
    css_content = get_common_css()
    
    # Générer le PDF
    font_config = FontConfiguration()
    html = HTML(string=html_content)
    css = CSS(string=css_content, font_config=font_config)
    
    pdf_bytes = BytesIO()
    html.write_pdf(pdf_bytes, stylesheets=[css], font_config=font_config)
    pdf_bytes.seek(0)
    
    return pdf_bytes


def get_common_css() -> str:
    """Retourne le CSS commun pour tous les PDFs."""
    return """
    @page {
        size: A4;
        margin: 2cm;
    }
    
    body {
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: 11pt;
        line-height: 1.6;
        color: #333;
    }
    
    h1 {
        color: #0d9488;
        font-size: 24pt;
        margin-bottom: 0.5cm;
        border-bottom: 3px solid #0d9488;
        padding-bottom: 0.3cm;
    }
    
    h2 {
        color: #0d9488;
        font-size: 18pt;
        margin-top: 1cm;
        margin-bottom: 0.5cm;
    }
    
    h3 {
        color: #0f766e;
        font-size: 14pt;
        margin-top: 0.7cm;
        margin-bottom: 0.3cm;
    }
    
    .header {
        text-align: center;
        margin-bottom: 1cm;
    }
    
    .user-info {
        background-color: #f0fdfa;
        padding: 0.5cm;
        border-radius: 0.2cm;
        margin-bottom: 1cm;
    }
    
    .score-box {
        background-color: #ccfbf1;
        padding: 0.8cm;
        border-radius: 0.3cm;
        text-align: center;
        margin: 1cm 0;
    }
    
    .score-value {
        font-size: 36pt;
        font-weight: bold;
        color: #0d9488;
    }
    
    .insight-box {
        background-color: #f9fafb;
        padding: 0.5cm;
        border-left: 4px solid #0d9488;
        margin: 0.5cm 0;
    }
    
    .recommendation-box {
        background-color: #fffbeb;
        padding: 0.5cm;
        border-left: 4px solid #f59e0b;
        margin: 0.5cm 0;
    }
    
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 0.5cm 0;
    }
    
    th {
        background-color: #0d9488;
        color: white;
        padding: 0.3cm;
        text-align: left;
    }
    
    td {
        padding: 0.3cm;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .footer {
        margin-top: 2cm;
        padding-top: 0.5cm;
        border-top: 1px solid #e5e7eb;
        font-size: 9pt;
        color: #6b7280;
        text-align: center;
    }
    
    ul {
        margin: 0.3cm 0;
        padding-left: 1cm;
    }
    
    li {
        margin: 0.2cm 0;
    }
    """


def generate_tki_html(results: Dict[str, Any], user_name: str, user_email: str) -> str:
    """Génère le HTML pour un rapport TKI."""
    scores = results.get('scores', {})
    mode_scores = scores.get('mode_scores', {})
    insights = results.get('insights', {})
    recommendations = results.get('recommendations', [])
    
    # Trouver le mode dominant
    dominant_mode = max(mode_scores.items(), key=lambda x: x[1]) if mode_scores else ('', 0)
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>TKI Assessment Report - {user_name}</title>
    </head>
    <body>
        <div class="header">
            <h1>TKI Conflict Style Assessment Report</h1>
            <p>Generated on {datetime.now().strftime('%B %d, %Y')}</p>
        </div>
        
        <div class="user-info">
            <p><strong>Name:</strong> {user_name}</p>
            <p><strong>Email:</strong> {user_email}</p>
        </div>
        
        <div class="score-box">
            <p style="margin: 0; font-size: 14pt;">Your Dominant Conflict Mode</p>
            <p class="score-value">{dominant_mode[0].upper()}</p>
            <p style="margin: 0;">Score: {dominant_mode[1]}/12</p>
        </div>
        
        <h2>Your Conflict Mode Profile</h2>
        <table>
            <tr>
                <th>Mode</th>
                <th>Score</th>
                <th>Percentage</th>
            </tr>
    """
    
    for mode, score in mode_scores.items():
        percentage = round((score / 12) * 100)
        html += f"""
            <tr>
                <td><strong>{mode.capitalize()}</strong></td>
                <td>{score}/12</td>
                <td>{percentage}%</td>
            </tr>
        """
    
    html += """
        </table>
        
        <h2>Detailed Insights</h2>
    """
    
    for mode, insight in insights.items():
        if isinstance(insight, dict) and 'description' in insight:
            html += f"""
            <div class="insight-box">
                <h3>{mode.capitalize()}</h3>
                <p>{insight['description']}</p>
            </div>
            """
    
    if recommendations:
        html += "<h2>Personalized Recommendations</h2>"
        for rec in recommendations:
            html += f"""
            <div class="recommendation-box">
                <h3>{rec.get('title', 'Recommendation')}</h3>
                <p>{rec.get('description', '')}</p>
            """
            if 'actions' in rec and rec['actions']:
                html += "<p><strong>Actions:</strong></p><ul>"
                for action in rec['actions']:
                    html += f"<li>{action}</li>"
                html += "</ul>"
            html += "</div>"
    
    html += """
        <div class="footer">
            <p>This report was generated by ARISE - Leadership Development Platform</p>
            <p>© 2026 ARISE. All rights reserved.</p>
        </div>
    </body>
    </html>
    """
    
    return html


def generate_wellness_html(results: Dict[str, Any], user_name: str, user_email: str) -> str:
    """Génère le HTML pour un rapport Wellness."""
    scores = results.get('scores', {})
    pillar_scores = scores.get('pillar_scores', {})
    total_score = scores.get('total_score', 0)
    max_score = scores.get('max_score', 150)
    percentage = scores.get('percentage', 0)
    insights = results.get('insights', {})
    recommendations = results.get('recommendations', [])
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Wellness Assessment Report - {user_name}</title>
    </head>
    <body>
        <div class="header">
            <h1>Wellness Assessment Report</h1>
            <p>Generated on {datetime.now().strftime('%B %d, %Y')}</p>
        </div>
        
        <div class="user-info">
            <p><strong>Name:</strong> {user_name}</p>
            <p><strong>Email:</strong> {user_email}</p>
        </div>
        
        <div class="score-box">
            <p style="margin: 0; font-size: 14pt;">Overall Wellness Score</p>
            <p class="score-value">{total_score}/{max_score}</p>
            <p style="margin: 0; font-size: 18pt; color: #0f766e;">{percentage:.1f}%</p>
        </div>
        
        <h2>Wellness Pillars Breakdown</h2>
        <table>
            <tr>
                <th>Pillar</th>
                <th>Score</th>
                <th>Percentage</th>
            </tr>
    """
    
    for pillar, score in pillar_scores.items():
        percentage = round((score / 25) * 100)
        html += f"""
            <tr>
                <td><strong>{pillar.replace('_', ' ').title()}</strong></td>
                <td>{score}/25</td>
                <td>{percentage}%</td>
            </tr>
        """
    
    html += """
        </table>
        
        <h2>Insights by Pillar</h2>
    """
    
    for pillar, insight in insights.items():
        if isinstance(insight, dict) and 'description' in insight:
            html += f"""
            <div class="insight-box">
                <h3>{pillar.replace('_', ' ').title()}</h3>
                <p>{insight['description']}</p>
            </div>
            """
    
    if recommendations:
        html += "<h2>Personalized Recommendations</h2>"
        for rec in recommendations:
            html += f"""
            <div class="recommendation-box">
                <h3>{rec.get('title', 'Recommendation')}</h3>
                <p>{rec.get('description', '')}</p>
            """
            if 'actions' in rec and rec['actions']:
                html += "<p><strong>Actions:</strong></p><ul>"
                for action in rec['actions']:
                    html += f"<li>{action}</li>"
                html += "</ul>"
            html += "</div>"
    
    html += """
        <div class="footer">
            <p>This report was generated by ARISE - Leadership Development Platform</p>
            <p>© 2026 ARISE. All rights reserved.</p>
        </div>
    </body>
    </html>
    """
    
    return html


def generate_360_html(results: Dict[str, Any], user_name: str, user_email: str) -> str:
    """Génère le HTML pour un rapport 360° Feedback."""
    # Similar structure to wellness
    return generate_wellness_html(results, user_name, user_email).replace(
        'Wellness Assessment Report',
        '360° Feedback Report'
    ).replace(
        'Wellness Pillars',
        'Leadership Capabilities'
    )


def generate_mbti_html(results: Dict[str, Any], user_name: str, user_email: str) -> str:
    """Génère le HTML pour un rapport MBTI."""
    scores = results.get('scores', {})
    mbti_type = scores.get('mbti_type', 'XXXX')
    dimension_preferences = scores.get('dimension_preferences', {})
    insights = results.get('insights', {})
    recommendations = results.get('recommendations', [])
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>MBTI Assessment Report - {user_name}</title>
    </head>
    <body>
        <div class="header">
            <h1>MBTI Personality Assessment Report</h1>
            <p>Generated on {datetime.now().strftime('%B %d, %Y')}</p>
        </div>
        
        <div class="user-info">
            <p><strong>Name:</strong> {user_name}</p>
            <p><strong>Email:</strong> {user_email}</p>
        </div>
        
        <div class="score-box">
            <p style="margin: 0; font-size: 14pt;">Your Personality Type</p>
            <p class="score-value">{mbti_type}</p>
            <p style="margin: 0; font-size: 14pt;">{insights.get('type_name', '')}</p>
        </div>
        
        <h2>Type Description</h2>
        <p>{insights.get('type_description', '')}</p>
        
        <h2>Your Dimensions</h2>
        <table>
            <tr>
                <th>Dimension</th>
                <th>Preference</th>
                <th>Strength</th>
            </tr>
    """
    
    for dimension, prefs in dimension_preferences.items():
        preference = prefs.get('preference', '')
        percentage = prefs.get(preference, 0)
        html += f"""
            <tr>
                <td><strong>{dimension}</strong></td>
                <td>{preference}</td>
                <td>{percentage:.1f}%</td>
            </tr>
        """
    
    html += "</table>"
    
    if 'strengths' in insights:
        html += "<h2>Your Strengths</h2><ul>"
        for strength in insights['strengths']:
            html += f"<li>{strength}</li>"
        html += "</ul>"
    
    if 'challenges' in insights:
        html += "<h2>Growth Areas</h2><ul>"
        for challenge in insights['challenges']:
            html += f"<li>{challenge}</li>"
        html += "</ul>"
    
    if recommendations:
        html += "<h2>Development Recommendations</h2>"
        for rec in recommendations:
            html += f"""
            <div class="recommendation-box">
                <h3>{rec.get('title', 'Recommendation')}</h3>
                <p>{rec.get('description', '')}</p>
            """
            if 'actions' in rec and rec['actions']:
                html += "<p><strong>Actions:</strong></p><ul>"
                for action in rec['actions']:
                    html += f"<li>{action}</li>"
                html += "</ul>"
            html += "</div>"
    
    html += """
        <div class="footer">
            <p>This report was generated by ARISE - Leadership Development Platform</p>
            <p>© 2026 ARISE. All rights reserved.</p>
        </div>
    </body>
    </html>
    """
    
    return html
