import WordFill from "@/components/ui/WordFill";
import Sheet from "./Sheet";
import s from "./Statement.module.css";

// The first day section: one idea, in the serif at display size. A normal section (its height is its
// content): the words brighten one by one as it comes up the screen, and the paragraph is there from
// the start.
export default function Statement() {
  return (
    <Sheet id="statement" className={s.statement} innerClassName={`${s.inner} page grid`} thread labelledBy="statement-title">
      <WordFill id="statement-title" className={`t-display ${s.title}`} trigger="#statement"
        text="Most businesses pay to be seen. Then lose people to a slow site and a late reply." />
      <p className={`lead soft ${s.lead}`}>
        We fix the whole journey with one team: the ads, the website, the AI agents and the software, built to work together from day one.
      </p>
    </Sheet>
  );
}
