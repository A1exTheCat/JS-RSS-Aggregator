import view from './view.js';
import i18next from 'i18next';
import resources from './locales/index.js';

export default () => {
  const initState = {
    form: {
      uiStatus: 'initial',
      error: '',
      feed: [],
      posts: [],
      urlList: [],
      readedPosts: [],
    },
    modalWindow: {
      id: 0,
    }
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: resources,
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    view (initState, e, i18nextInstance);
  });
}