import Link from 'next/link';
import { Star } from 'react-icons/fa';

const Navigation = () => {
  return (
    <nav className="border-t border-neutral-100">
      <div className="flex space-x-8 py-3 overflow-x-auto">
        <Link href="/categories/all" className="text-primary font-medium whitespace-nowrap">
          All Categories
        </Link>
        <Link href="/categories/electronics" className="text-neutral-600 hover:text-primary whitespace-nowrap transition-colors">
          Electronics
        </Link>
        <Link href="/categories/fashion" className="text-neutral-600 hover:text-primary whitespace-nowrap transition-colors">
          Fashion
        </Link>
        <Link href="/categories/home-garden" className="text-neutral-600 hover:text-primary whitespace-nowrap transition-colors">
          Home & Garden
        </Link>
        <Link href="/categories/sports" className="text-neutral-600 hover:text-primary whitespace-nowrap transition-colors">
          Sports
        </Link>
        <Link href="/categories/books" className="text-neutral-600 hover:text-primary whitespace-nowrap transition-colors">
          Books
        </Link>
        <Link href="/ai-recommended" className="text-accent font-medium whitespace-nowrap">
          <Star className="w-4 h-4 mr-1 inline" />
          AI Recommended
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;