
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Route,
  Switch,
  withRouter,
} from 'react-router-dom';
import axios from 'axios';

import { defaultParser } from '../input-parser';

import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import APIErrorPage from './pages/APIErrorPage';

class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      searchTerm: null,
      searchResults: null,
      errors: null,
      loading: false,
    };
  }

  handleSearch = (input) => {
    const { history } = this.props;

    const apiURI = `${API_URL}/parser`;
    const data = defaultParser(input);

    this.setState({
      loading: true,
    });

    axios
      .post(apiURI, { input: data })
      .then((response) => {
        const { errors, results } = response.data;

        Object.values(response.data.results)
          .forEach((set) => {
            const sortedRows = set.rows.slice(0); // make a copy

            sortedRows.sort((a, b) => {
              let scoreA = 1;
              let scoreB = 1;

              const canonical = 100;
              const significances = 10;
              const length = 1;

              scoreA = (a.protein.canonical) ? (scoreA * canonical) : scoreA;
              scoreB = (b.protein.canonical) ? (scoreB * canonical) : scoreB;

              scoreA = (a.significances.functional) ? (scoreA + significances) : scoreA;
              scoreB = (b.significances.functional) ? (scoreB + significances) : scoreB;

              scoreA = (a.significances.transcript) ? (scoreA + significances) : scoreA;
              scoreB = (b.significances.transcript) ? (scoreB + significances) : scoreB;

              scoreA = (a.significances.clinical) ? (scoreA + significances) : scoreA;
              scoreB = (b.significances.clinical) ? (scoreB + significances) : scoreB;

              scoreA = (a.significances.structural) ? (scoreA + significances) : scoreA;
              scoreB = (b.significances.structural) ? (scoreB + significances) : scoreB;

              scoreA = (a.significances.genomic) ? (scoreA + significances) : scoreA;
              scoreB = (b.significances.genomic) ? (scoreB + significances) : scoreB;

              if (a.protein.length > b.protein.length) {
                scoreA += length;
              } else if (a.protein.length < b.protein.length) {
                scoreB += length;
              }

              a.score = scoreA;
              b.score = scoreB;

              return scoreB - scoreA;
            });

            set.rows = sortedRows;
          });

        console.log('>>> search response:', response.data);

        this.setState({
          searchTerm: input,
          searchResults: results,
          errors,
          loading: false,
        });

        history.push('search');
      })
      .catch((e) => {
        console.log('Got an axios error:', e);
        history.push('api-error');
      });
  }

  handleDownload = () => {
    const { searchTerm } = this.state;

    const apiURI = `${API_URL}/download`;
    const data = defaultParser(searchTerm);
    console.log('handle download clicked');
    axios
      .post(apiURI, {
        input: data,
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'pepvep-data.csv'); // or any other extension
        document.body.appendChild(link);
        link.click();
      })
      .catch((e) => {
        console.log('Got an axios error:', e);
      });
  }

  render() {
    const appProps = {
      ...this.state,
      handleSearch: this.handleSearch,
      handleDownload: this.handleDownload,
    };

    return (
      <Switch>
        <Route path={`${BASE_URL}/`} exact render={() => <HomePage {...appProps} />} />
        <Route path={`${BASE_URL}/search`} render={() => <SearchResultsPage {...appProps} />} />
        <Route path={`${BASE_URL}/api-error`} render={() => <APIErrorPage {...appProps} />} />
        <Route component={({ location }) => (
          <h3>
            404: Can&lsquo;t find
            {location.pathname}
          </h3>
        )}
        />
      </Switch>
    );
  }
}

App.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export default withRouter(App);
