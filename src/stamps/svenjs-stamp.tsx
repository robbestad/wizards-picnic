import { create } from "svenjs";
import svenjsMark from "../svenjs-mark.svg";

const REPO = "https://github.com/robbestad/awizardspicnic";

export const SvenjsStamp = create({
  render() {
    return (
      <a
        className="svenjs-credit"
        href="https://svenjs.xyz/"
        rel="noopener noreferrer"
      >
        <img
          className="svenjs-mark"
          src={svenjsMark}
          width="36"
          height="36"
          alt=""
        />
        <span className="svenjs-credit-copy">
          <span className="svenjs-credit-kicker">UI built with</span>
          <span className="svenjs-credit-name">SvenJS 3.2.1</span>
        </span>
      </a>
    );
  },
});

export const SiteFooter = create({
  render() {
    return (
      <footer className="site-foot">
        <a className="repo-link" href={REPO} rel="noopener noreferrer">
          GitHub
        </a>
        <SvenjsStamp />
      </footer>
    );
  },
});
