'use strict';
(function(){
  if(!window.BIBLE||document.getElementById('biblePanel'))return;
  const panel=document.createElement('section');panel.id='biblePanel';
  panel.innerHTML='<h2>Bíblia · Bíblia Portuguesa Mundial</h2><p class="muted">Pesquise por livro, capítulo e versículo. O texto fica disponível offline.</p><div class="bibleFields"><select id="bibleBook"></select><input id="bibleChapter" type="number" min="1" value="1" placeholder="Capítulo"><input id="bibleVerses" placeholder="Versículo ou intervalo (ex.: 1-4)"></div><button id="bibleFind" class="primary">Mostrar passagem</button><button id="bibleProject" class="primary" disabled>Projetar passagem</button><div id="biblePreview" class="biblePreview">Escolha uma referência.</div><small class="muted">Bíblia Portuguesa Mundial · domínio público · texto em revisão.</small>';
  $('source').before(panel);const select=$('bibleBook');
  for(const b of BIBLE){const option=document.createElement('option');option.value=b.code;option.textContent=b.name;select.append(option)}
  let passage=null;
  function find(){const bibleBook=BIBLE.find(x=>x.code===select.value),chapter=bibleBook?.chapters[String(Number($('bibleChapter').value))];if(!bibleBook||!chapter)return notify('Capítulo não encontrado.');const match=$('bibleVerses').value.trim().match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/);const first=match?Number(match[1]):1,last=match&&match[2]?Number(match[2]):first;const verses=chapter.filter(v=>v.v>=first&&v.v<=last);if(!verses.length)return notify('Versículo não encontrado.');passage={book:bibleBook.name,chapter:Number($('bibleChapter').value),verses,text:verses.map(v=>v.v+' '+v.text).join('\n')};$('biblePreview').textContent=passage.text;$('bibleProject').disabled=false}
  function project(){if(!passage)return;live={book:'Bíblia Portuguesa Mundial',number:'',title:passage.book+' '+passage.chapter,label:'Versículos '+passage.verses[0].v+(passage.verses.length>1?'–'+passage.verses[passage.verses.length-1].v:''),text:passage.text,moment:'culto'};blank=false;testing=false;sync()}
  $('bibleFind').onclick=find;$('bibleProject').onclick=project;
})();
