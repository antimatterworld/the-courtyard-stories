import { Link } from "react-router-dom";
import { Page } from "../components/Chrome";
import { localBusiness } from "../lib/schema";

export default function NotFound() {
  return (
    <Page
      title="Page not found · The Courtyard Stories, Delhi"
      description="That frame isn't in the archive — find your way back to the studio."
      schema={[localBusiness()]}
    >
      <section className="page-hero">
        <span className="ghost-num" aria-hidden="true">404</span>
        <div className="container">
          <p className="eyebrow">Frame not found</p>
          <h1 className="h1">
            This reel <span className="serif-italic">wasn't developed</span>
          </h1>
          <p className="lead" style={{ marginTop: "var(--s-5)", maxWidth: "42ch" }}>
            The page you asked for isn't in the archive. The rest of the studio is
            exactly where it should be.
          </p>
          <div className="hero-ctas">
            <Link to="/" className="btn btn-primary">
              Back to the courtyard
            </Link>
            <Link to="/work" className="btn btn-ghost">
              Browse the work
            </Link>
          </div>
        </div>
      </section>
    </Page>
  );
}
