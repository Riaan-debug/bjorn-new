import Link from "next/link";
import { SiteChrome } from "@/components/site/SiteChrome";
import { publicSettings, publicSite } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reviews" };

export default function ReviewsPage() {
  const settings = publicSettings();
  const reviews = publicSite().reviews;

  return (
    <SiteChrome>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-mist">From guests</p>
        <h1 className="mt-3 font-display text-5xl font-light text-navy">Reviews</h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-mist">
          A few lines from the counter. If you had a good cup, the honest place to say so is Google.
        </p>
        {settings.googleReviewUrl || settings.googleBizUrl ? (
          <a
            href={settings.googleReviewUrl || settings.googleBizUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block bg-navy px-6 py-3 text-[12px] uppercase tracking-[0.22em] text-cream"
          >
            Leave a Google review
          </a>
        ) : null}

        <div className="mt-14 space-y-12">
          {reviews.map((review) => (
            <blockquote key={review.id} className="border-t border-line pt-8">
              <p className="font-display text-3xl font-light leading-snug text-navy">“{review.quote}”</p>
              {review.name ? <p className="mt-4 text-sm text-mist">{review.name}</p> : null}
            </blockquote>
          ))}
          {!reviews.length ? (
            <p className="text-sm leading-7 text-mist">
              No lines on the site yet. Bjorn adds them from the hub when they come in.
            </p>
          ) : null}
        </div>

        <Link href="/about" className="mt-16 inline-block text-[12px] uppercase tracking-[0.22em] text-navy underline underline-offset-4">
          About Apostellō
        </Link>
      </div>
    </SiteChrome>
  );
}
