# 사용법: npx astro preview 를 켠 뒤  python3 tools/og/make-og.py ./   → og-a.png(첫 화면형), og-b.png(질문형)
# 링크 미리보기 이미지(1200×627)를 실제 첫 화면에서 만들어요. 900×470 화면을 1.333배로 찍어 글자가 작은 썸네일에서도 읽히게.
import asyncio, sys
from playwright.async_api import async_playwright
OUT=(sys.argv[1].rstrip('/') + '/') if len(sys.argv) > 1 else './'   # 저장할 폴더
CSS = """
.hero{min-height:470px!important;height:470px!important}
.nav ul,.actions,.credit{display:none!important}
.nav-in{height:60px}
.nav-name{font-size:15px}
.og-url{position:absolute;right:var(--gutter);bottom:20px;color:rgba(255,255,255,.42);font-size:12px}
#hero-gl,#hero-ov{transform:translateX(-34px)}
.shade{background:linear-gradient(90deg,rgba(0,0,0,.7) 0%,rgba(0,0,0,.25) 36%,transparent 54%)!important}
.hero-body{padding-bottom:42px!important}
.lede{font-size:17px!important;max-width:34ch!important;margin-top:16px!important;color:#a6a6a6!important}
"""
VAR = {
 'a': "",
 'b': """.hero h1{font-size:40px!important;line-height:1.08!important;letter-spacing:-0.04em!important;max-width:15ch!important}.lede{display:none!important}""",
}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        for k, extra in VAR.items():
            pg = await b.new_page(viewport={'width':900,'height':470}, device_scale_factor=1200/900, reduced_motion='reduce')
            await pg.goto('http://127.0.0.1:4321/'); await pg.wait_for_timeout(2500)
            await pg.add_style_tag(content=CSS+extra)
            await pg.evaluate("""(k)=>{const n=document.querySelector('.hero'); const s=document.createElement('span'); s.className='og-url'; s.textContent='crstn-bio.github.io'; n.appendChild(s);
              if(k==='b'){document.querySelector('.hero h1').textContent='How can we learn enough of one brain to predict what happens when we intervene?'}
              window.dispatchEvent(new Event('resize'))}""", k)
            await pg.wait_for_timeout(2500)
            await pg.screenshot(path=OUT+f'og-{k}.png', clip={'x':0,'y':0,'width':900,'height':470.25})
            await pg.close()
        await b.close()
asyncio.run(main())
