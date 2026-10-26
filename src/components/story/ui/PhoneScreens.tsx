"use client";
import type { CSSProperties } from "react";
import { example, type ExampleMedia } from "@/content/example-business";
import Slotted from "./Slotted";
import s from "./screens.module.css";

// Everything the story's phone shows, stacked: the social feed with the Marlow & Finch ad, the
// salon's mobile site, and its chat. Driven by CSS variables written each frame from the rig:
// --feed, --tap, --site, --chat, --msg, --typing. 390 × 844 CSS px.
const Blocks = ({ n = 3 }: { n?: number }) => (
  <div className={s.postLines}>{Array.from({ length: n }, (_, i) => <i key={i} style={{ width: `${88 - i * 22}%` }} />)}</div>
);
function Post({ tone }: { tone: number }) {
  return (
    <div className={s.post}>
      <div className={s.postHead}><i className={s.avatar} style={{ background: `hsl(30 6% ${20 + tone * 6}%)` }} /><Blocks n={2} /></div>
      <div className={s.postMedia} style={{ background: `hsl(32 8% ${16 + tone * 4}%)` }} />
      <Blocks />
    </div>
  );
}

export function AdPost({ media, active = true }: { media: ExampleMedia; active?: boolean }) {
  return (
    <article className={s.ad} data-ad>
      <header className={s.adHead}>
        <span className={s.adAvatar}>{example.initials}</span>
        <span className={s.adWho}><b>{example.name}</b><small>{example.ad.sponsored}</small></span>
      </header>
      <div className={s.adMedia}>
        <Slotted slot="example-ad" src={media.ad ? example.ad.image : null} video={media.adVideo ? example.ad.video : null} tone="green" active={active} />
      </div>
      <p className={s.adLine}>{example.ad.line}</p>
      <div className={s.adCta} data-anchor="ad-cta">
        <span>{example.ad.cta}</span><span aria-hidden="true">→</span>
        <i className={s.ripple} />
      </div>
    </article>
  );
}

export function SalonMobile({ media }: { media: ExampleMedia }) {
  return (
    <div className={s.mSite}>
      <header className={s.mNav}><b>{example.short}</b><span className={s.mBurger}><i /><i /></span></header>
      <div className={s.mHero}>
        <Slotted slot="example-site-hero" src={media.hero ? example.site.hero : null} tone="green" />
      </div>
      <div className={s.mBody}>
        <h3 className={s.mTitle}>{example.site.headline}</h3>
        <p className={s.mSub}>{example.site.sub}</p>
        <span className={s.mBtn}>{example.site.cta}</span>
        <ul className={s.mList}>
          {example.site.services.map((x) => <li key={x.name}><b>{x.name}</b><small>{x.line}</small></li>)}
        </ul>
      </div>
    </div>
  );
}

export function Chat({ empty = false }: { empty?: boolean }) {
  return (
    <div className={s.chat}>
      <header className={s.chatHead}>
        <span className={s.adAvatar}>{example.initials}</span>
        <span className={s.chatWho}><b>{example.chat.header}</b><small><i className={s.online} />Online</small></span>
      </header>
      <div className={s.chatBody}>
        {empty ? <p className={s.chatEmpty}>No messages yet.</p> : example.chat.messages.map((m, i) => (
          <div key={i} className={m.from === "agent" ? s.msgAgent : s.msgCustomer} style={{ "--i": i } as CSSProperties} data-msg={i}>
            <p>{m.text}</p><small>{m.time}</small>
          </div>
        ))}
        {!empty && <div className={s.typing} aria-hidden="true"><i /><i /><i /></div>}
      </div>
      <div className={s.chatInput}><span>Message</span><i /></div>
    </div>
  );
}

export default function PhoneScreens({ media, mode = "story", active = true }: { media: ExampleMedia; mode?: "story" | "ad" | "chat" | "empty"; active?: boolean }) {
  return (
    <div className={s.phone} data-screen="phone" data-mode={mode}>
      <div className={s.status}><span>23:46</span><span className={s.statusIcons}><i /><i /><i /></span></div>
      {(mode === "story" || mode === "ad") && (
        <div className={`${s.layer} ${s.feedLayer}`}>
          <div className={s.feedTop}><b>Feed</b><span className={s.feedIcons}><i /><i /></span></div>
          <div className={s.feedScroll}>
            <div className={s.stories}>{[0, 1, 2, 3, 4].map((i) => <i key={i} />)}</div>
            <Post tone={1} />
            <Post tone={3} />
            <AdPost media={media} active={active} />
            <Post tone={2} />
          </div>
        </div>
      )}
      {mode === "story" && <div className={`${s.layer} ${s.siteLayer}`}><SalonMobile media={media} /></div>}
      {mode !== "ad" && <div className={`${s.layer} ${s.chatLayer}`}><Chat empty={mode === "empty"} /></div>}
    </div>
  );
}
