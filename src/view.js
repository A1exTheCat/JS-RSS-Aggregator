import * as yup from 'yup';
import onChange from 'on-change';
import { setLocale } from 'yup';
import axios from 'axios';
import { parser, updatingParser } from './parser';

export default (initState, event, i18nextInstance) => {
  // DOM element(could be reasonable to separate it to object with all elements for work)
  const feedback = document.querySelector('.feedback');
  const input = document.querySelector('#url-input');
  ///////////////
  // watched state for actions and renders, without state's manipulations
  const state = onChange(initState, (path, value, previousValue) => {
    // here we adding reaction in states data and write render func or changes in classes(View)
    // and behavior of input window and texts
    // renderFunc (state, i18nextInstance) and func below is working and should be in render func, but we need to switch url from feed
    if (path === 'form.uiStatus') {
      switch (value) {
        case 'valid': 
        //prepare page
          input.classList.remove('is-invalid');
          input.value = '';
          input.focus();
          feedback.classList.remove("text-danger");
          feedback.classList.add("text-success");
          feedback.textContent = i18nextInstance.t('form.success.successForm');
          console.log(state);
        // render here items
        break;
  
      case 'invalid': 
        feedback.classList.remove("text-success");
        feedback.classList.add("text-danger");
        feedback.textContent = state.form.error;
        input.classList.add('is-invalid');
        break;
      }
    }

    if (path === 'form.error' && state.form.uiStatus === 'invalid') {
      feedback.textContent = state.form.error;
    }
  });
  //////////////////
  // custom dictionary for yup errors, which we will write down in state as error 
  setLocale({
    string: {
      url: i18nextInstance.t('form.errors.errorString'),
    },
    mixed: {
      notOneOf: i18nextInstance.t('form.errors.errorNotOneOf'),
    }
  });
  // yup schema for validation
  const schema =  yup.string().url().notOneOf(state.form.urlList);
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
          //write a new part with updatingParser here
          setTimeout(function updater () {
            const list = state.form.urlList;
            list.map((url) => {
              axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
              .then((response) => {
              const newPosts = updatingParser(response, state);
              state.form.posts.push(...newPosts);
              })
              .catch(console.log);
            });
            setTimeout (updater, 5000)
          }, 5000);
        })
        .catch(() => {
          state.form.error = i18nextInstance.t('form.errors.network');
          state.form.uiStatus = 'invalid';
        });
    })
    .catch((e) => {
      state.form.error = e.message;
      state.form.uiStatus = 'invalid';
    });
};
