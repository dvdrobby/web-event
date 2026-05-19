import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
    return (
        <header>
            <nav>
                <Link href="/" className="logo">
                    <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
                    <p>DevEvent</p>
                </Link>
                <ul className="events">
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/">Events</Link></li>
                    <li><Link href="/">Create Event</Link></li>
                </ul>
            </nav>
        </header>
    )
}