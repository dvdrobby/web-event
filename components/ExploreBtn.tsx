"use client";

import Image from "next/image";
import posthog from "posthog-js";

export default function ExploreBtn() {
    return (
        <button onClick={() => { console.log("Click"); posthog.capture("explore_events_clicked"); }} type="button" id="explore-btn" className="border-dark-200 bg-dark-100 flex w-fit cursor-pointer  rounded-full border px-8 py-3.5 max-sm:w-full text-center mt-7 mx-auto opacity-80"  >
            <a href="#event">
                Explore Events
                <Image src="/icons/arrow-down.svg" alt="arrow-down" width={24} height={24} />
            </a>
        </button>
    )
}