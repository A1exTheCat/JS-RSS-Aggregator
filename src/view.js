import * as yup from 'yup';
import onChange from 'on-change';
import { setLocale } from 'yup';
import axios from 'axios';
import { parser, updatingParser } from './parser';
import render from './render';

export default (initState, event, i18nextInstance) => {
  // DOM element(could be reasonable to separate it to object with all elements for work)
  const elements = {
    body: document.querySelector('body'),
    feedback: document.querySelector('.feedback'),
    input: document.querySelector('#url-input'),
    modalWindow: document.querySelector('.modal'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };
  // watched state for actions and renders, without state's manipulations
  const state = onChange(initState, (path, value) => {
    // here we adding reaction in states data and write render func or changes in classes(View)
    // and behavior of input window and texts
    // !!!!!should be in render func, but we need to switch url from feed
    if (path === 'form.feed') {
      elements.input.value = '';
      render(path, state, elements);
    }
    if (path === 'form.posts') {
      render(path, state, elements);
      const postsLinks = elements.posts.querySelectorAll('a');
      const postsButtons = elements.posts.querySelectorAll('button');
      postsLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          if (!state.form.readedPosts.includes(e.target.dataset.id)) {
            state.form.readedPosts.push(e.target.dataset.id);
          }
        });
      });
      postsButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          state.modalWindow.id = e.target.dataset.id;
          if (!state.form.readedPosts.includes(e.target.dataset.id)) {
            state.form.readedPosts.push(e.target.dataset.id);
          }
        });
      });
    }
    if (path === 'form.readedPosts') {
      const readedId = value[value.length - 1];
      const readedPost = elements.posts.querySelector(`[data-id='${readedId}']`);
      readedPost.classList.remove('fw-bold');
      readedPost.classList.add('fw-normal', 'link-secondary');
      console.log(readedPost);
    }
    if (path === 'modalWindow.id') {
      const modalTitle = elements.modalWindow.querySelector('.modal-title');
      const modalBody = elements.modalWindow.querySelector('.modal-body');
      const modalLink = elements.modalWindow.querySelector('a');
      const currentModalData = state.form.posts.filter((post) => post.id === value)[0];
      modalTitle.textContent = currentModalData.title;
      modalBody.textContent = currentModalData.desc;
      modalLink.setAttribute('href', currentModalData.link);
    }
    if (path === 'form.uiStatus') {
      if (value === 'valid') {
        // prepare page
        elements.input.classList.remove('is-invalid');
        elements.input.value = '';
        elements.input.focus();
        elements.feedback.classList.remove('text-danger');
        elements.feedback.classList.add('text-success');
        elements.feedback.textContent = i18nextInstance.t('form.success.successForm');
      }
      if (value === 'invalid') {
        elements.feedback.classList.remove('text-success');
        elements.feedback.classList.add('text-danger');
        elements.feedback.textContent = state.form.error;
        elements.input.classList.add('is-invalid');
      }
    }

    if (path === 'form.error' && state.form.uiStatus === 'invalid') {
      elements.feedback.textContent = state.form.error;
    }
  });
  // custom dictionary for yup errors, which we will write down in state as error
  setLocale({
    string: {
      url: i18nextInstance.t('form.errors.errorString'),
    },
    mixed: {
      notOneOf: i18nextInstance.t('form.errors.errorNotOneOf'),
    },
  });
  // yup schema for validation
  const schema = yup.string().url().notOneOf(state.form.urlList);
  // data from event for validation
  const formData = new FormData(event.target);
  const url = formData.get('url');
  // validation
  schema.validate(url, { abortEarly: false })
    .then(() => {
      axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
        .then((response) => {
          const { newFeed, newPosts } = parser(response);
          state.form.feed.push(newFeed);
          state.form.posts.push(...newPosts);
          state.form.error = '';
          state.form.urlList.push(url);
          state.form.uiStatus = 'valid';
          // part with updatingParser here
          setTimeout(function updater() {
            const list = state.form.urlList;
            list.forEach((updatedUrl) => {
              axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(updatedUrl)}`)
                .then((updatedResponse) => {
                  const updatedPosts = updatingParser(updatedResponse, state);
                  state.form.posts.push(...updatedPosts);
                });
            });
            setTimeout(updater, 5000);
          }, 5000);
        })
        .catch((e) => {
          if (e.message === 'Network Error') {
            state.form.error = i18nextInstance.t('form.errors.network');
          } else {
            state.form.error = i18nextInstance.t('form.errors.invalidRss');
          }
          state.form.uiStatus = 'invalid';
        });
    })
    .catch((e) => {
      state.form.error = e.message;
      state.form.uiStatus = 'invalid';
    });
};
