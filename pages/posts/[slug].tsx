import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Head from 'next/head'
import { GetStaticPaths, GetStaticProps } from 'next'
import { GetServerSideProps } from 'next';
import Container from '../../components/container'
import PostBody from '../../components/post-body'
import MoreStories from '../../components/more-stories'
import Header from '../../components/header'
import PostHeader from '../../components/post-header'
import SectionSeparator from '../../components/section-separator'
import Layout from '../../components/layout'
import PostTitle from '../../components/post-title'
import Tags from '../../components/tags'
import { getAllPostsWithSlug, getPostAndMorePosts } from '../../lib/api'
import { CMS_NAME } from '../../lib/constants'



export default function Post({slug, host, post, posts, preview }) {
	const morePosts = posts?.edges
	const removeTags = (str: string) => {
		if (str === null || str === '') return '';
		else str = str.toString();
		return str.replace(/(<([^>]+)>)/gi, '').replace(/\[[^\]]*\]/, '');
	};


  return (
    <Layout preview={preview}>
      <Container>
        <Header />
   
          <>
            <article>
              <Head>
                <title>{post.title}</title>
				<meta property="og:title" content={post.title}/>
                <meta name="description" content={removeTags(post.excerpt)} />
                <meta property="og:type" content="article" />
				<meta property="og:locale" content="en_US" />
                <meta property="og:description" content={removeTags(post.excerpt)}/>
                <meta property="og:url" content={`https://${host}/posts/${slug}`}/>
                <meta property="og:site_name" content={host}/>
                {post.categories.edges.map((post:any) => (
                <meta property="article:section" content={post.node.name}/>
                ))}
                <meta property="og:image"content={post.featuredImage?.node.sourceUrl}/>
                <meta property="og:image:secure_url" content={post.featuredImage?.node.sourceUrl} />
                <meta property="og:image:width" content="750" />
                <meta property="og:image:height" content="390" />
                <meta property="og:image:alt" content={post.title} />
                <meta property="og:image:type" content="image/jpeg" />
                <meta property="article:published_time" content={`${post.date}+00:00`}/>
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.featuredImage}
                date={post.date}
                author={post.author}
                categories={post.categories}
                
              />
              <PostBody content={post.content} />
              <footer>
                {post.tags.edges.length > 0 && <Tags tags={post.tags} />}
              </footer>
            </article>

            <SectionSeparator />
            {morePosts.length > 0 && <MoreStories posts={morePosts} />}
          </>
       
      </Container>
    </Layout>
  )
}


//////////////


export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
  preview = false,
  previewData,

}) => {

  const slug = params?.slug;
 
  const host = req.headers.host;

  const referringURL = req.headers?.referer || null;
  const domain_url = process.env.WORDPRESS_API_URL as string;
  const data = await getPostAndMorePosts(params?.slug, preview, previewData)


if ((referringURL?.includes('t.co'))||(referringURL?.includes('twitter.com'))||(referringURL?.includes('facebook.com'))) {
		return {
			redirect: {
				permanent: false,
				destination: `${
					domain_url.replace(/(\/graphql)/, '/') + encodeURI(slug  as string)
				}`,
			},
		};
	}
  

 
  

  return {
    props: {
      
      slug,
      host,
      preview,
      post: data.post,
      posts: data.posts,
    }
  }
}
