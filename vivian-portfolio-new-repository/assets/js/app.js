async function loadPortfolioContent() {
  try {
    const response = await fetch('content/portfolio.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Portfolio content could not be loaded');
    return await response.json();
  } catch (error) { console.warn('Portfolio content could not be loaded.', error); return null; }
}
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const projectGrid = document.getElementById('project-grid');
const dialog = document.getElementById('project-dialog');
const dialogContent = document.getElementById('dialog-content');
let projectData = {};
function renderProjectVideo(rawUrl, caption, thumbnail) {
  if (!rawUrl) return '';
  let url;
  try { url = new URL(rawUrl.trim()); } catch { return ''; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';

  const href = escapeHTML(url.href);
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  const isDirectVideo = /\.(mp4|webm|ogg)(?:$|[?#])/i.test(url.href);
  let embed = '';

  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    if (id) embed = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id);
  } else if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
    const id = url.searchParams.get('v') || (url.pathname.match(/\/(?:shorts|embed)\/([^/?]+)/) || [])[1];
    if (id) embed = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id);
  } else if (host === 'vimeo.com' || host.endsWith('.vimeo.com')) {
    const id = (url.pathname.match(/\/(?:video\/)?(\d+)/) || [])[1];
    if (id) embed = 'https://player.vimeo.com/video/' + encodeURIComponent(id);
  }

  const captionHtml = caption ? '<p class="video-caption">' + escapeHTML(caption) + '</p>' : '';
  if (host === 'instagram.com' || host.endsWith('.instagram.com')) {
    const permalink = escapeHTML(url.href.split('?')[0]);
    return '<div class="project-video-wrap instagram-video-embed"><blockquote class="instagram-media" data-instgrm-permalink="' + permalink + '" data-instgrm-version="14" style="background:#fff;border:0;border-radius:12px;margin:0 auto;max-width:540px;min-width:280px;width:100%;"></blockquote>' + captionHtml + '</div>';
  }
  if (isDirectVideo) {
    const poster = thumbnail ? ' poster="' + escapeHTML(thumbnail) + '"' : '';
    return '<div class="project-video-wrap"><video controls playsinline preload="metadata"' + poster + ' src="' + href + '"></video>' + captionHtml + '</div>';
  }
  if (embed && !thumbnail) {
    return '<div class="project-video-wrap"><div class="project-video-frame"><iframe src="' + escapeHTML(embed) + '" title="Project video" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>' + captionHtml + '</div>';
  }
  if (thumbnail) {
    return '<div class="project-video-wrap"><a class="project-video-preview" href="' + href + '" target="_blank" rel="noopener noreferrer" aria-label="Watch project video"><img class="project-video-thumbnail" src="' + escapeHTML(thumbnail) + '" alt="' + escapeHTML(caption || 'Project video preview') + '" loading="lazy"><span class="project-video-play" aria-hidden="true">▶</span></a>' + captionHtml + '<p class="video-caption">Select the preview to watch on the original platform.</p></div>';
  }
  return '<div class="project-video-wrap"><a class="project-video-preview project-video-preview-empty" href="' + href + '" target="_blank" rel="noopener noreferrer" aria-label="Watch project video"><span class="project-video-placeholder">VIDEO PREVIEW</span><span class="project-video-play" aria-hidden="true">▶</span></a>' + captionHtml + '<p class="video-caption">Select the preview to watch on the original platform.</p></div>';
}
function renderProjectResources(project) {
  const resources = [];
  const documentPath = typeof project.strategy_document === 'string' ? project.strategy_document.trim() : '';
  if (documentPath) {
    let safeDocument = '';
    try {
      const parsed = new URL(documentPath, window.location.origin);
      if (parsed.origin === window.location.origin && parsed.pathname.startsWith('/assets/uploads/')) safeDocument = parsed.href;
      else if (parsed.protocol === 'https:' || parsed.protocol === 'http:') safeDocument = parsed.href;
    } catch {}
    if (safeDocument) resources.push('<a class="project-resource-link" href="' + escapeHTML(safeDocument) + '" target="_blank" rel="noopener noreferrer">View strategy document (PDF) ↗</a>');
  }
  const presentation = typeof project.presentation_link === 'string' ? project.presentation_link.trim() : '';
  if (presentation) {
    try {
      const parsed = new URL(presentation);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') resources.push('<a class="project-resource-link" href="' + escapeHTML(parsed.href) + '" target="_blank" rel="noopener noreferrer">View presentation ↗</a>');
    } catch {}
  }
  return resources.length ? '<div class="project-resources">' + resources.join('') + '</div>' : '';
}
function renderProjects(projects) {
  projectData = {};
  projectGrid.innerHTML = (projects || []).map((project, index) => {
    projectData[project.id] = project;
    const visualClass = ({social:'visual-media',experience:'visual-community',creative:'visual-video',concept:'visual-campaign'})[project.category] || 'visual-media';
    const image = project.image ? `<img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.image_alt || project.title)}" loading="lazy">` : '';
    return `<article class="project-card ${index === 0 ? 'project-large ' : ''}reveal" data-category="${escapeHTML(project.category)}" data-project="${escapeHTML(project.id)}"><button class="project-open" aria-label="View ${escapeHTML(project.title)} case study"><div class="project-visual ${visualClass}">${image}<span class="visual-label">${escapeHTML(project.kicker)}</span><span class="project-arrow">↗</span></div><div class="project-info"><div><p class="project-client">${escapeHTML(project.client)}</p><h3>${escapeHTML(project.title)}</h3></div><span class="project-year">${escapeHTML(project.year)}</span></div></button></article>`;
  }).join('');
  const count = document.getElementById('project-count');
  if (count) count.textContent = String((projects || []).length).padStart(2, '0');
  projectGrid.querySelectorAll('.project-open').forEach(button => button.addEventListener('click', () => {
    const project = projectData[button.closest('[data-project]').dataset.project]; if (!project) return;
    dialogContent.innerHTML = `<span class="dialog-kicker">${escapeHTML(project.kicker)}</span><h2>${escapeHTML(project.title)}</h2><p class="dialog-summary">${escapeHTML(project.summary)}</p>${renderProjectVideo(project.video, project.video_caption, project.video_thumbnail)}${renderProjectResources(project)}${(project.sections || []).map(section => `<section><h3>${escapeHTML(section.heading)}</h3><p>${escapeHTML(section.body)}</p></section>`).join('')}<div class="dialog-note">${escapeHTML(project.note || '')}</div><p><a class="text-link" href="#contact" onclick="document.getElementById('project-dialog').close()">Discuss a similar project ↗</a></p>`;
    dialog.showModal();
    if (dialogContent.querySelector('.instagram-media')) {
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      } else if (!document.querySelector('script[data-instagram-embed]')) {
        const embedScript = document.createElement('script');
        embedScript.src = 'https://www.instagram.com/embed.js';
        embedScript.async = true;
        embedScript.dataset.instagramEmbed = 'true';
        embedScript.onload = () => window.instgrm?.Embeds?.process();
        document.body.appendChild(embedScript);
      }
    }
  }));
  projectGrid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  applyProjectFilter(document.querySelector('.filter-button.active')?.dataset.filter || 'all');
}
function renderTestimonials(items) {
  const grid = document.getElementById('testimonial-grid');
  if (!items?.length) { grid.innerHTML = '<p class="testimonial-empty">Client and colleague feedback will appear here as approved testimonials are added.</p>'; return; }
  grid.innerHTML = items.map(item => {
    const screenshot = item.screenshot ? `<a class="testimonial-screenshot-link" href="${escapeHTML(item.screenshot)}" target="_blank" rel="noopener noreferrer"><img class="testimonial-screenshot" src="${escapeHTML(item.screenshot)}" alt="${escapeHTML(item.screenshot_alt || 'Screenshot of testimonial feedback')}" loading="lazy"></a>` : '';
    const quote = item.quote ? `<p>${escapeHTML(item.quote)}</p>` : '';
    const attribution = (item.name || item.role) ? `<footer><span class="avatar-initial">${escapeHTML((item.name || 'V').trim().charAt(0).toUpperCase())}</span><span><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.role)}</small></span></footer>` : '';
    return `<blockquote class="testimonial-card ${item.featured ? 'testimonial-featured' : ''} reveal"><span class="quote-mark">“</span>${screenshot}${quote}${attribution}</blockquote>`;
  }).join('');
  grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
function applyProjectFilter(filter) { document.querySelectorAll('.project-card').forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; }); }
const menuToggle = document.querySelector('.menu-toggle'); const nav = document.querySelector('.main-nav');
menuToggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(open)); menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); }));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
document.querySelectorAll('.filter-button').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.filter-button').forEach(item => item.classList.remove('active')); button.classList.add('active'); applyProjectFilter(button.dataset.filter); }));
document.getElementById('year').textContent = new Date().getFullYear();
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', event => { event.preventDefault(); if (!contactForm.reportValidity()) return; const data = new FormData(contactForm); const subject = encodeURIComponent(`Portfolio enquiry: ${data.get('interest')}`); const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nInterest: ${data.get('interest')}\n\n${data.get('message')}`); window.location.href = `mailto:vivianigbokweify@gmail.com?subject=${subject}&body=${body}`; });
function renderMeetVideo(rawUrl) {
  const shell = document.querySelector('.meet-video-shell');
  if (!shell) return;
  const raw = String(rawUrl || '').trim();
  const match = raw.match(/https?:\/\/[^\s"'<>]+/i);
  if (!match) return;
  let url;
  try { url = new URL(match[0].replace(/[),.;]+$/, '')); } catch { return; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return;
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  let videoId = '';
  if (host === 'youtu.be') videoId = url.pathname.split('/').filter(Boolean)[0] || '';
  else if (host === 'youtube.com' || host.endsWith('.youtube.com')) videoId = url.searchParams.get('v') || (url.pathname.match(/\/(?:shorts|embed)\/([^/?]+)/) || [])[1] || '';
  if (!videoId || !/^[A-Za-z0-9_-]{6,}$/.test(videoId)) return;
  shell.removeAttribute('aria-label');
  shell.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(videoId) + '" title="Meet Vivian Igbokwe introduction video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
}
function applyEditableCopy(copy) {
  if (!copy) return;
  document.querySelectorAll('[data-content-field]').forEach(element => {
    const key = element.dataset.contentField;
    if (typeof copy[key] === 'string' && copy[key].trim()) element.textContent = copy[key];
  });
}
loadPortfolioContent().then(content => { if (!content) return; if (content.portrait) document.getElementById('hero-portrait').src = content.portrait; if (content.about_portrait) document.getElementById('about-portrait').src = content.about_portrait; const zeroImage = document.getElementById('zero-to-smm-image'); if (content.zero_to_smm_image && zeroImage) zeroImage.src = content.zero_to_smm_image; const cvLink = document.getElementById('cv-link'); if (cvLink && content.cv_file) cvLink.href = content.cv_file; applyEditableCopy(content.site_copy); renderMeetVideo(content.site_copy?.intro_video_url); renderProjects(content.projects || []); renderTestimonials(content.testimonials || []); });
