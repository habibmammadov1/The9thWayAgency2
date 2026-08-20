const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchHero(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/home/hero?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn('API fetch failed, falling back to static data for hero', error);
    return null;
  }
}

export async function fetchUniqueness(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/home/uniqueness?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn('API fetch failed, falling back to static data for uniqueness', error);
    return null;
  }
}

export async function fetchAboutStats(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/home/about-stats?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn('API fetch failed, falling back to static data for about-stats', error);
    return null;
  }
}

export async function fetchFooter(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/home/footer?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn('API fetch failed, falling back to static data for footer', error);
    return null;
  }
}

export async function fetchClientLogos() {
  try {
    const res = await fetch(`${API_URL}/api/client-logos`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return data.filter((logo: any) => logo.isActive);
  } catch (error) {
    console.warn('API fetch failed, falling back to static data for client logos', error);
    return null;
  }
}

export async function fetchTestimonialsIntro(locale: string, page: string) {
  try {
    const res = await fetch(`${API_URL}/api/testimonials/intro?locale=${locale}&page=${page}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed, falling back to static data for testimonials intro (page: ${page})`, error);
    return null;
  }
}

export async function fetchTestimonialsHighlight(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/testimonials/highlight?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn('API fetch failed, falling back to static data for testimonials highlight', error);
    return null;
  }
}

export async function fetchTestimonialsList(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/testimonials/list?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return data.testimonials || [];
  } catch (error) {
    console.warn('API fetch failed, falling back to static data for testimonials list', error);
    return null;
  }
}

export async function fetchPortfolioHero(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/portfolio/hero?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn('API fetch failed, falling back to static data for portfolio hero', error);
    return null;
  }
}

export async function fetchPortfolioCaseStudies(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/portfolio/case-studies?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return data.caseStudies || [];
  } catch (error) {
    console.warn('API fetch failed, falling back to static data for portfolio case studies', error);
    return null;
  }
}

export async function fetchPortfolioFAQ(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/portfolio/faq?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn('API fetch failed, falling back to static data for portfolio FAQ', error);
    return null;
  }
}

export async function fetchCaseStudyBySlug(locale: string, slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/portfolio/case-studies/${slug}?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed, falling back to static data for case study: ${slug}`, error);
    return null;
  }
}

export async function fetchBlogCategories(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/blog/categories?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed for categories (locale: ${locale})`, error);
    return null;
  }
}

export async function fetchBlogPosts(locale: string, page = 1, category = '', search = '', limit = 6) {
  try {
    const query = new URLSearchParams({
      locale,
      page: String(page),
      category,
      search,
      limit: String(limit),
    }).toString();
    const res = await fetch(`${API_URL}/api/blog/posts?${query}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed for posts (locale: ${locale})`, error);
    return null;
  }
}

export async function fetchBlogPostBySlug(locale: string, slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/blog/posts/${slug}?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed for post slug: ${slug} (locale: ${locale})`, error);
    return null;
  }
}

export async function fetchBlogPostById(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/blog/posts/id/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed for post id: ${id}`, error);
    return null;
  }
}

export async function saveBlogCategories(locale: string, categories: any[]) {
  const res = await fetch(`${API_URL}/api/blog/categories?locale=${locale}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categories }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Categories sync failed');
  }
  return await res.json();
}

export async function createBlogPost(post: any) {
  const res = await fetch(`${API_URL}/api/blog/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create blog post');
  }
  return await res.json();
}

export async function updateBlogPost(id: string, post: any) {
  const res = await fetch(`${API_URL}/api/blog/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update blog post');
  }
  return await res.json();
}

export async function deleteBlogPost(id: string) {
  const res = await fetch(`${API_URL}/api/blog/posts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete blog post');
  }
  return await res.json();
}

export async function fetchAboutStudioIntro(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/about/studio-intro?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed for studio intro (locale: ${locale})`, error);
    return null;
  }
}

export async function updateAboutStudioIntro(locale: string, data: any) {
  const res = await fetch(`${API_URL}/api/about/studio-intro?locale=${locale}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update Studio Intro');
  }
  return await res.json();
}

export async function fetchAboutWhatWeBuild(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/about/what-we-build?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed for what-we-build (locale: ${locale})`, error);
    return null;
  }
}

export async function updateAboutWhatWeBuild(locale: string, data: any) {
  const res = await fetch(`${API_URL}/api/about/what-we-build?locale=${locale}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update What We Build');
  }
  return await res.json();
}

export async function fetchAboutMissionVision(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/about/mission-vision?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed for mission-vision (locale: ${locale})`, error);
    return null;
  }
}

export async function updateAboutMissionVision(locale: string, data: any) {
  const res = await fetch(`${API_URL}/api/about/mission-vision?locale=${locale}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update Mission & Vision');
  }
  return await res.json();
}

export async function fetchTeamIntro(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/team/intro?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed for team intro (locale: ${locale})`, error);
    return null;
  }
}

export async function updateTeamIntro(locale: string, data: any) {
  const res = await fetch(`${API_URL}/api/team/intro?locale=${locale}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update Team Intro');
  }
  return await res.json();
}

export async function fetchTeamTeaser(locale: string, page: string) {
  try {
    const res = await fetch(`${API_URL}/api/team/teaser?locale=${locale}&page=${page}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed for team teaser (locale: ${locale}, page: ${page})`, error);
    return null;
  }
}

export async function updateTeamTeaser(locale: string, page: string, data: any) {
  const res = await fetch(`${API_URL}/api/team/teaser?locale=${locale}&page=${page}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update Team Teaser');
  }
  return await res.json();
}

export async function fetchTeamMembers(locale: string, limit?: number, showAll: boolean = false) {
  try {
    const limitQuery = limit ? `&limit=${limit}` : '';
    const activeQuery = showAll ? '&active=false' : '';
    const res = await fetch(`${API_URL}/api/team/members?locale=${locale}${limitQuery}${activeQuery}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed for team members (locale: ${locale})`, error);
    return [];
  }
}

export async function updateTeamMembers(locale: string, data: any) {
  const res = await fetch(`${API_URL}/api/team/members?locale=${locale}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update Team Members');
  }
  return await res.json();
}

export async function fetchContactWhyChooseUs(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/contact/why-choose-us?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed for contact why-choose-us (locale: ${locale})`, error);
    return { content: null, cards: [] };
  }
}

export async function updateContactWhyChooseUs(locale: string, data: any) {
  const res = await fetch(`${API_URL}/api/contact/why-choose-us?locale=${locale}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update Why Choose Us content');
  }
  return await res.json();
}

export async function fetchContactInfo(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/contact/info?locale=${locale}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed for contact info (locale: ${locale})`, error);
    return { info: null, socialLinks: [] };
  }
}

export async function updateContactInfo(locale: string, data: any) {
  const res = await fetch(`${API_URL}/api/contact/info?locale=${locale}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update Contact Info');
  }
  return await res.json();
}

export async function submitContactForm(data: any) {
  const res = await fetch(`${API_URL}/api/contact/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit form');
  }
  return await res.json();
}

export async function fetchContactSubmissions(status: string, page: number = 1) {
  try {
    const res = await fetch(`${API_URL}/api/contact/submissions?status=${status}&page=${page}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (error) {
    console.warn(`API fetch failed for submissions (status: ${status}, page: ${page})`, error);
    return { submissions: [], pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 }, unreadCount: 0 };
  }
}

export async function updateSubmissionStatus(id: string, status: string) {
  const res = await fetch(`${API_URL}/api/contact/submissions/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update submission status');
  }
  return await res.json();
}

// ─── Translations ──────────────────────────────────────────────────────────

export interface TranslationEntry {
  id: string;
  namespace: string;
  key: string;
  locale: string;
  value: string;
  updatedAt: string;
}

export async function fetchAllTranslations(): Promise<TranslationEntry[]> {
  const res = await fetch(`${API_URL}/api/translations/all`, { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch translations');
  }
  return await res.json();
}

export async function updateTranslations(
  updates: { namespace: string; key: string; locale: string; value: string }[]
): Promise<{ updated: number }> {
  const res = await fetch(`${API_URL}/api/translations`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save translations');
  }
  return await res.json();
}

