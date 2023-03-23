export default (path, state, elements) => {
  if (path === 'form.feed') {
    // preparing header of feed and posts just for first time
    if (state.form.feed.length === 1) {
      const divFeed = document.createElement('div');
      divFeed.classList.add('card', 'border-0');
      const divBody = document.createElement('div');
      divBody.classList.add('card-body');
      const title = document.createElement('h2');
      title.classList.add('card-title', 'h4');
      title.innerText = 'Фиды';
      divBody.append(title);
      divFeed.append(divBody);
      const ulFeed = document.createElement('ul');
      ulFeed.classList.add('list-group', 'border-0', 'rounded-0');
      elements.feeds.append(divFeed);
      elements.feeds.append(ulFeed);  

      const divPosts = document.createElement('div');
      divPosts.classList.add('card', 'border-0');
      const divPostsBody = document.createElement('div');
      divPostsBody.classList.add('card-body');
      const titlePosts = document.createElement('h2');
      titlePosts.classList.add('card-title', 'h4');
      titlePosts.innerText = 'Посты';
      divPostsBody.append(titlePosts);
      divPosts.append(divPostsBody);
      const ulPosts = document.createElement('ul');
      ulPosts.classList.add('list-group', 'border-0', 'rounded-0');
      elements.posts.append(divPosts);
      elements.posts.append(ulPosts); 
    }
    // adding a new feed
    const feedUl = elements.feeds.querySelector('ul');
    const feedInfo = state.form.feed[state.form.feed.length - 1];
    const list = document.createElement('li');
    list.classList.add('list-group-item', 'border-0', 'border-end-0');
    const itemTitle = document.createElement('h3');
    itemTitle.classList.add('h6', 'm-0');
    itemTitle.innerText = feedInfo.title;
    const itemDesc = document.createElement('p');
    itemDesc.classList.add('m-0', 'small', 'text-black-50');
    itemDesc.innerText = feedInfo.desc;
    list.append(itemTitle);
    list.append(itemDesc);
    feedUl.prepend(list);
  }
  // adding a new posts
  if (path === 'form.posts') {
    const newPosts = document.createElement('div');
    state.form.posts.map((post) => {
      const list = document.createElement('li');
      list.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      const link = document.createElement('a');
      link.setAttribute('href', post.link);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      if (state.form.readedPosts.includes(post.id)) {
        link.classList.add('fw-normal', 'link-secondary');
      } else {link.classList.add('fw-bold')};      
      link.setAttribute('data-id', post.id);
      link.innerText = post.title;
      const btn = document.createElement('button');
      btn.setAttribute('type', 'button');
      btn.setAttribute('data-id', post.id);
      btn.setAttribute('data-bs-toggle', 'modal');
      btn.setAttribute('data-bs-target', '#modal');
      btn.classList.add('btn', 'btn-outline-primary', 'btn-sm')
      btn.innerText = 'Просмотр';
      list.append(link);
      list.append(btn);
      newPosts.prepend(list);
    })
    const postsUl = elements.posts.querySelector('ul');
    postsUl.innerHTML = newPosts.innerHTML;
  }
}