import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import Button from '../../elements/form/Button';
import ExpandedPositionalSignificance from '../significances/ExpandedPositionalSignificance';
import ExpandedTranscriptSignificance from '../significances/ExpandedTranscriptSignificance';
import ExpandedClinicalSignificance from '../significances/ExpandedClinicalSignificance';
import ExpandedStructuralSignificance from '../significances/ExpandedStructuralSignificance';

class ImpactSearchResults extends Component {
  state = {
    expandedRow: null,
  }

  toggleSignificanceRow(rowId, significanceType) {
    const { expandedRow } = this.state;
    const rowIdAndType = `${rowId}:${significanceType}`;

    this.setState({
      expandedRow: (rowIdAndType !== expandedRow)
        ? rowIdAndType
        : null,
    });
  }

  render() {
    const { expandedRow } = this.state;
    const { rows, handleDownload } = this.props;
    let counter = 0;

    const totalCounts = Object.values(rows)
      .reduce((total, current) => total + current.rows.length, 0);

    return (
      <div className="search-results">
        <div className="results-and-counter">
          <span className="results-counter">
            {totalCounts} Results Found
          </span>
          <Button onClick={handleDownload}>Download</Button>
        </div>
        <div className="legends">
          <div className="legends-item">
            <span className="legends-icon button--positional">P</span> Positional Significances
          </div>
          <div className="legends-item">
            <span className="legends-icon button--clinical">C</span> Clinical Significances
          </div>
          <div className="legends-item">
            <span className="legends-icon button--structural">S</span> Structural Significances
          </div>
          <div className="legends-item">
            <span className="legends-icon button--transcript">T</span> Transcript Significances
          </div>
        </div>

        <table border="0" className="unstriped" cellPadding="0" cellSpacing="1">
          <tbody>
            <tr>
              <th rowSpan="2">#</th>
              <th rowSpan="2">Gene Name</th>
              <th colSpan="4">Protein</th>
              <th colSpan="4">Genomic</th>
              <th rowSpan="2">Significance</th>
            </tr>
            <tr>
              <th>Accession</th>
              <th>Length</th>
              <th>Position</th>
              <th>Variant</th>
              <th>ENSG</th>
              <th>ENST</th>
              <th>Location</th>
              <th>Allele</th>
            </tr>

            {Object.keys(rows)
              .map((key) => {
                const group = rows[key];
                return (
                  <Fragment key={`${group.key}`}>
                    <tr>
                      <td colSpan="11" className="query-row">Query: {group.input}</td>
                    </tr>
                    {group.rows.map((row, i) => {
                      const { protein, gene, significances } = row;
                      const proteinPosition = (protein.start === protein.end)
                        ? protein.start
                        : `${protein.start}-${protein.end}`;
                      const geneLocation = `${gene.chromosome}:${gene.start}-${gene.end}`;
                      const rowKey = `${group.key}-${i}`;

                      let detailsPageLink = null;

                      if (protein.start && protein.variant) {
                        const varSTRes = protein.variant
                          .split('/')
                          .join(protein.start.toString());

                        const detailsPageURL = `https://www.ebi.ac.uk/thornton-srv/databases/cgi-bin/DisaStr/GetPage.pl?uniprot_acc=${protein.accession.toUpperCase()}&template=resreport.html&res=${varSTRes}`;
                        detailsPageLink = <a className="details-page-link" href={detailsPageURL} target="_blank">View Details</a>;
                      }

                      significances.transcript
                        .forEach((t) => {
                          t.hgvsg = gene.hgvsg;
                          t.hgvsp = gene.hgvsp;
                          t.canonical = protein.canonical;
                          t.codons = gene.codons;
                          t.aminoAcids = protein.variant;
                          t.start = protein.start;
                          t.end = protein.end;
                        });

                      counter += 1;

                      return (
                        <Fragment>
                          <tr key={rowKey}>
                            <td>{counter}</td>
                            <td>{gene.symbol}</td>
                            <td>{protein.accession}</td>
                            <td>{protein.length || '-'}</td>
                            <td>{proteinPosition || '-'}</td>
                            <td>
                              <span title={protein.variant || '-'}>{protein.threeLetterCodes || '-'}</span>
                            </td>
                            <td>{gene.ensgId}</td>
                            <td>{gene.enstId}</td>
                            <td>{geneLocation}</td>
                            <td>{gene.allele}</td>
                            <td>
                              {(typeof significances.positional !== 'undefined')
                                ? (
                                  <Button
                                    onClick={() => this.toggleSignificanceRow(rowKey, 'positional')}
                                    className="button--round button--positional"
                                  >
                                  P
                                  </Button>
                                ) : null }

                              {(typeof significances.clinical !== 'undefined')
                                ? (
                                  <Button
                                    onClick={() => this.toggleSignificanceRow(rowKey, 'clinical')}
                                    className="button--round button--clinical"
                                  >
                                  C
                                  </Button>
                                ) : null }

                              {(typeof significances.transcript !== 'undefined')
                                ? (
                                  <Button
                                    onClick={() => this.toggleSignificanceRow(rowKey, 'transcript')}
                                    className="button--round button--transcript"
                                  >
                                  T
                                  </Button>
                                ) : null }

                              {(typeof significances.structural !== 'undefined')
                                ? (
                                  <Button
                                    onClick={() => this.toggleSignificanceRow(rowKey, 'structural')}
                                    className="button--round button--structural"
                                  >
                                  S
                                  </Button>
                                ) : null }
                            </td>
                          </tr>
                          {(`${rowKey}:positional` === expandedRow)
                            ? (
                              <ExpandedPositionalSignificance
                                data={significances.positional}
                                detailsLink={detailsPageLink}
                              />
                            ) : null }

                          {(`${rowKey}:clinical` === expandedRow)
                            ? (
                              <ExpandedClinicalSignificance
                                data={significances.clinical}
                                detailsLink={detailsPageLink}
                              />
                            ) : null }

                          {(`${rowKey}:transcript` === expandedRow)
                            ? (
                              <ExpandedTranscriptSignificance
                                data={significances.transcript}
                                detailsLink={detailsPageLink}
                              />
                            ) : null }

                          {(`${rowKey}:structural` === expandedRow)
                            ? (
                              <ExpandedStructuralSignificance
                                data={significances.structural}
                                detailsLink={detailsPageLink}
                              />
                            ) : null }
                        </Fragment>
                      );
                    })}
                  </Fragment>
                );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

ImpactSearchResults.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    gene: PropTypes.shape({
      allele: PropTypes.string,
      chromosome: PropTypes.string,
      codons: PropTypes.string,
      end: PropTypes.number,
      ensgId: PropTypes.string,
      enstId: PropTypes.string,
      hgvsg: PropTypes.string,
      hgvsp: PropTypes.string,
      source: PropTypes.string,
      start: PropTypes.number,
      symbol: PropTypes.string,
    }).isRequired,
    protein: PropTypes.shape({
      accession: PropTypes.string,
      canonical: PropTypes.bool,
      end: PropTypes.number,
      length: PropTypes.number,
      name: PropTypes.shape({
        full: PropTypes.string,
        short: PropTypes.string,
      }),
      start: PropTypes.number,
      threeLetterCodes: PropTypes.string,
      variant: PropTypes.string,
    }).isRequired,
    significances: PropTypes.shape({}),
  })),
  handleDownload: PropTypes.func.isRequired,
};

ImpactSearchResults.defaultProps = {
  rows: [],
};

export default ImpactSearchResults;