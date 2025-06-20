import { allArticlesData } from '@/app/articles/data'
import { SignedOutBreadCrumbs } from '@/components/BreadCrumbs'
import { StructuredData } from '@/components/StructuredData'
import { dynamicBaseURL } from '@/library/environment/publicVariables'
import { isArticleSlug } from '@/library/utilities/tsx'
import type { Metadata } from 'next'
import { generateSizes } from 'next-tailwind-image-sizes'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Fragment } from 'react'
import type { Article, WithContext } from 'schema-dts'

type ResolvedParams = { article: string }
type Params = Promise<ResolvedParams>
type StaticParams = Promise<ResolvedParams[]>

export async function generateStaticParams(): StaticParams {
	return Object.keys(allArticlesData).map((article) => ({ article }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { article } = await params
	if (!isArticleSlug(article)) return notFound()
	const articleData = allArticlesData[article]

	if (!articleData) notFound()

	const { metaTitle, metaDescription, featuredImage } = articleData

	return {
		title: { absolute: metaTitle },
		// ToDo: use optimise metadata!
		description: metaDescription,
		openGraph: {
			images: [featuredImage.absolute],
		},
		alternates: {
			canonical: `${dynamicBaseURL}/articles/${article}`,
		},
	}
}

export default async function ArticlePage({ params }: { params: Params }) {
	const { article } = await params
	if (!isArticleSlug(article)) return notFound()

	const articleData = allArticlesData[article]
	if (!articleData) return notFound()

	const { displayTitle, content, featuredImage, metaDescription, slug } = articleData

	const articleSchema: WithContext<Article> = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: displayTitle,
		description: metaDescription,
		author: {
			'@type': 'Person',
			name: 'Dan Edwards',
			url: 'https://danedwardsdeveloper.com/',
		},
		publisher: {
			'@type': 'Organization',
			name: 'Simple Order',
		},
		url: `${dynamicBaseURL}/articles/${slug}`,
		image: featuredImage.absolute, // ToDo
		datePublished: new Date().toISOString(),
		dateModified: new Date().toISOString(),
	}

	return (
		<>
			<StructuredData data={articleSchema} />
			<SignedOutBreadCrumbs
				trail={[{ href: '/articles', displayName: 'Articles' }]} //
				currentPageTitle={displayTitle}
			/>
			<h1 className="sm:text-5xl text-balance">{displayTitle}</h1>
			<p className="mb-12">By Dan Edwards</p>
			<Image
				src={featuredImage.src}
				alt={featuredImage.alt}
				className="max-w-xl w-full rounded-md mb-12"
				sizes={generateSizes({
					paddingX: {
						default: 4,
						lg: 0,
					},
					maxWidth: 'xl',
				})}
				priority
			/>
			<div className="article-content flex flex-col max-w-prose gap-y-4 my-8 text-lg">
				{content.map((block, index) => {
					if (typeof block === 'string') {
						// biome-ignore lint/suspicious/noArrayIndexKey:
						return <p key={index}>{block}</p>
					}
					// biome-ignore lint/suspicious/noArrayIndexKey:
					return <Fragment key={index}>{block}</Fragment>
				})}
			</div>
			<hr className="border-t-2 border-zinc-300 mt-32 h-2" />
		</>
	)
}
