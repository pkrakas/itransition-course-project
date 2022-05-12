import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './Context/ThemeProvider'
import { I18nextProvider } from "react-i18next"
import i18n from './Translations/i18n'
import { BrowserRouter } from "react-router-dom";
import { store } from './State/store'
import { Provider } from 'react-redux'
import InitialAuth from './Features/InitialAuth'

InitialAuth(store)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </I18nextProvider>
      </BrowserRouter>
    </Provider>
);