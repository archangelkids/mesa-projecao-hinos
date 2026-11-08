import json,re,statistics
from pathlib import Path
import pdfplumber
root=Path(__file__).resolve().parent
books={}
report=[]
for key,name,columns in [('louvai','Louvai ao Senhor',2),('cantor','Cantor Cristão',1)]:
    hymns=[]; current=None; prev=None; stopped=False
    with pdfplumber.open(root/'pdfs'/f'{key}.pdf') as pdf:
        for pn,page in enumerate(pdf.pages,1):
            if stopped: break
            parts=[page.crop((i*page.width/columns,0,(i+1)*page.width/columns,page.height)) for i in range(columns)]
            for part in parts:
                prev=None
                for line in part.extract_text_lines(x_tolerance=2,y_tolerance=3,return_chars=False):
                    text=line['text'].strip()
                    if key=='louvai' and text.startswith('ÍNDICE DE ASSUNTOS'): stopped=True; break
                    match=re.match(r'^(\d{1,3})\.\s+(.+)$' if key=='louvai' else r'^(\d{3})\s*[-–]\s*(.+)$',text)
                    if match and (not hymns or int(match[1])>hymns[-1]['number']):
                        current={'number':int(match[1]),'title':match[2],'page':pn,'lines':[],'flags':[]}
                        hymns.append(current); prev=None; continue
                    if not current: continue
                    if re.fullmatch(r'\d+',text): continue
                    if prev and line['top']-prev>4.5: current['lines'].append('')
                    current['lines'].append(text);prev=line['bottom']
    for h in hymns:
        raw='\n'.join(h.pop('lines')).strip()
        chunks=[s.strip() for s in re.split(r'\n\s*\n',raw) if s.strip()]
        sections=[]; stanza=0
        for chunk in chunks:
            coro=bool(re.match(r'^(coro|estribilho|refrão)\b',chunk,re.I))
            if not coro: stanza+=1
            sections.append({'label':'Coro' if coro else f'Estrofe {stanza}','text':chunk})
        if not sections: h['flags'].append('Letra vazia')
        if '\ufffd' in raw or '(cid:' in raw: h['flags'].append('Caractere não reconhecido')
        if any(len(s['text'].splitlines())>8 for s in sections): h['flags'].append('Trecho longo: confira a divisão das estrofes')
        h['flags'].append('Divisões e coro inferidos: conferir com o PDF')
        h['sections']=sections;h['reviewed']=False
    books[key]={'name':name,'hymns':hymns}
    report.append({'book':name,'count':len(hymns),'last':hymns[-1]['title'],'pages':len(pdf.pages),'missing_numbers':[n for n in range(1,hymns[-1]['number']+1) if n not in {h['number'] for h in hymns}]})
(root/'data.js').write_text('window.HYMN_BOOKS='+json.dumps(books,ensure_ascii=False)+';',encoding='utf-8')
(root/'catalogo-original.json').write_text(json.dumps(books,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'extracao.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=True))

