import uniqueId from 'lodash/uniqueId.js';

const parser = (response) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(response.data.contents, "text/html");
  const newFeed = {};
  
  const channel = doc.querySelector('channel');
  const items = channel.querySelectorAll('item');

  newFeed.title = channel.querySelector('title').textContent;
  newFeed.desc = channel.querySelector('description').textContent;

  const newPosts = [];
  items.forEach((item) => {
    const itemInfo = {
      id: uniqueId(),
      title: item.querySelector('title').textContent,
      link: item.querySelector('link').nextSibling.textContent.trim(),
      desc: item.querySelector('description').textContent.trim(),
    }
    newPosts.unshift(itemInfo);
  });

  return { newFeed, newPosts};
};

const updatingParser = (response, state) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(response.data.contents, "text/html");

  const channel = doc.querySelector('channel');
  const items = channel.querySelectorAll('item');

  const updatedPosts = [];
  const postsNames = state.form.posts.map((post) => post.title);
  items.forEach((item) => {
    if (!postsNames.includes(item.querySelector('title').textContent)) {
      const itemInfo = {
        id: uniqueId(),
        title: item.querySelector('title').textContent,
        link: item.querySelector('link').nextSibling.textContent.trim(),
        desc: item.querySelector('description').textContent.trim(),
      }
      updatedPosts.push(itemInfo);
    } 
  });

  return updatedPosts;
}

export { parser, updatingParser };