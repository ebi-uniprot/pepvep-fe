
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import Button from '../../elements/form/Button';
import AboutSection from '../other/AboutSection';

class TextAreaSearch extends Component {
  state = {
    searchTerm: '',
  }

  componentWillMount() {
    this.useExampleData();
  }

  handleInputChange = (e) => {
    this.setState({
      searchTerm: e.target.value,
    });
  }

  handleSubmit = (e) => {
    const { searchTerm } = this.state;
    const { onSubmit } = this.props;

    e.preventDefault();
    e.stopPropagation();

    onSubmit(searchTerm);
  }

  clearForm = () => {
    this.setState({
      searchTerm: '',
    });
  }

  useExampleData = () => {
    const searchTerm = [
      '14 89993420 89993420 A/G . . .',
      '20 58909365 58909365 C/A . . .',
      '3 165830358 165830358 T/C . . .',
      '21 43072000 43072000 T/C . . .',
      '21 43060540 43060540 C/T . . .',
      '22 19479862 19479862 G/C . . .',
      '22 19494512 19494512 C/G . . .',

      // '21 25891796 25891796 C/T',
      // '21 25891784 25891784 C/T',
      // '21 25891784 25891784 C/G',
      // '21 25891784 25891784 C/A',
      // '14 73173571 73173571 A/G',
      // '14 73173574 73173574 C/T',
      // '14 73173577 73173577 C/T',
      // '14 73173577 73173577 C/G',
      // '14 73173587 73173587 A/T',
      // '14 73173587 73173587 A/C',
      // '14 73173644 73173644 G/C',
      // '14 73173644 73173644 G/A',
      // '14 73173665 73173665 G/T',
      // '14 73173665 73173665 G/C',
      // '14 73173665 73173665 G/A',
    ].join('\n');

    this.setState({
      searchTerm,
    });
  }

  render() {
    const { searchTerm } = this.state;
    const { buttonLabel, isLoading } = this.props;

    return (
      <Fragment>
        <div className="text-area-search">
          <h3>Variant Input</h3>

          <div className="input-examples">
            <b>Examples</b>
            <br />
            <div>
              <span>Genomic Position:</span>
              <span className="variant-example">3 165830358 165830358 T/C</span>
            </div>
            <div>
              <span>Gene Symbol:</span>
              <span className="variant-example">TP53:p.Arg175His</span>
            </div>
            <div>
              <span>dbSNP HGVS:</span>
              <span className="variant-example">NM_145255.3:c.526C&gt;T</span>
            </div>
          </div>

          <form onSubmit={this.handleSubmit}>

            <textarea
              id="main-textarea-search-field"
              className="main-textarea-search-field"
              value={searchTerm}
              onChange={this.handleInputChange}
            />

            <span className="assemly-ref-note">
              Reference Genome Assembly: GRCh38 (hg38)
            </span>

            <a
              href="http://www.ensembl.org/Homo_sapiens/Tools/AssemblyConverter?db=core"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Ensembl Assembly Remapping
            </a>

            <div id="search-button-group" className="search-button-group">
              {(!isLoading)
                ? (
                  <Button type="submit" onClick={this.handleSubmit} className="button--primary">
                    {buttonLabel}
                  </Button>
                ) : (
                  <Button onClick={() => null} className="button--secondary">
                    Loading...
                  </Button>
                )
              }

              {(searchTerm)
                ? (
                  <Button onClick={this.clearForm}>
                    Clear Input
                  </Button>
                ) : (
                  <Button onClick={this.useExampleData}>
                    Use Example Input
                  </Button>
                )
              }
            </div>

          </form>
        </div>

        <AboutSection />
      </Fragment>
    );
  }
}

TextAreaSearch.propTypes = {
  buttonLabel: PropTypes.string,
  onSubmit: PropTypes.func,
  isLoading: PropTypes.bool.isRequired,
};

TextAreaSearch.defaultProps = {
  buttonLabel: 'Search',
  onSubmit: () => undefined,
};

export default TextAreaSearch;
