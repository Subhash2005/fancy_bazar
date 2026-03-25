import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, name, type, image, canonical }) {
    const siteTitle = 'FancyBazaar - Premier Marketplace for Fancy Items';
    const siteDescription = 'Shop luxury watches, stationery, and premium gifts at wholesale and retail prices on FancyBazaar.';
    const siteUrl = 'https://fancybazaar.vercel.app';
    const siteImage = '/logo.png';

    const fullTitle = title ? `${title} | FancyBazaar` : siteTitle;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{fullTitle}</title>
            <meta name='description' content={description || siteDescription} />
            <link rel="canonical" href={canonical || siteUrl} />

            {/* Facebook / Open Graph tags */}
            <meta property="og:type" content={type || 'website'} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || siteDescription} />
            <meta property="og:image" content={image || siteImage} />

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name || 'FancyBazaar'} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || siteDescription} />
            <meta name="twitter:image" content={image || siteImage} />
        </Helmet>
    );
}
