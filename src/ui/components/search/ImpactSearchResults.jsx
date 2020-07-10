import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import Button from '../../elements/form/Button';
import ExpandedFunctionalSignificance from '../significances/ExpandedFunctionalSignificance';
import ExpandedTranscriptSignificance from '../significances/ExpandedTranscriptSignificance';
import ExpandedClinicalSignificance from '../significances/ExpandedClinicalSignificance';
import ExpandedStructuralSignificance from '../significances/ExpandedStructuralSignificance';
import ExpandedGenomicSignificance from '../significances/ExpandedGenomicSignificance';
import ProteinReviewStatus from '../other/ProteinReviewStatus';
import SearchResultsLegends from '../other/SearchResultsLegends';

class ImpactSearchResults extends Component {
  state = {
    expandedRow: null,
    showAllIsoforms: false,
    openGroup: null,
  }

  toggleAllIsoforms = () => {
    const { showAllIsoforms } = this.state;

    this.setState({
      showAllIsoforms: !showAllIsoforms,
      openGroup: null,
    });
  }

  toggleAcessionIsoforms = (group) => {
    const { openGroup } = this.state;

    this.setState({
      openGroup: (openGroup === group) ? null : group,
    });
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
    const { rows, handleDownload } = this.props;
    const {
      expandedRow,
      showAllIsoforms,
      openGroup,
    } = this.state;

    let counter = 0;

    return (
      <div className="search-results">
        <SearchResultsLegends />

        <div className="results-and-counter">
          <Button onClick={handleDownload}>Download</Button>
          <Button onClick={this.toggleAllIsoforms}>
            {(showAllIsoforms) ? 'Hide ' : 'Show '}
            Isoforms
          </Button>
        </div>

        <table border="0" className="unstriped" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <th colSpan="2" rowSpan="2">Gene Name</th>
              <th colSpan="3">Protein</th>
              <th colSpan="3">Genomic</th>
              <th colSpan="5">Impact</th>
            </tr>
            <tr>
              <th>Accession</th>
              <th>Position</th>
              <th>Variant</th>
              <th>Location</th>
              <th>Allele</th>
              <th>Var ID</th>
              <th>C</th>
              <th>G</th>
              <th>T</th>
              <th>F</th>
              <th>S</th>
            </tr>

            {Object.keys(rows)
              .map((key) => {
                const group = rows[key];

                return (
                  <Fragment key={`${group.key}`}>
                    <tr>
                      <td colSpan="7" className="query-row">
                        <Button
                          onClick={() => this.toggleAcessionIsoforms(group.key)}
                          className="button button--toggle-isoforms"
                        >
                          {(!showAllIsoforms && openGroup !== group.key) ? '+' : null}
                          {(showAllIsoforms || openGroup === group.key) ? '- ' : null}
                        </Button>

                        Query:
                        {group.input}
                      </td>
                      <td className="query-row">
                        {group.rows[0] && group.rows[0].variation
                          && group.rows[0].variation.dbSNPId}
                      </td>
                      <td colSpan="6" className="query-row">
                        HGVSg:
                        {' '}
                        {group.rows[0] && group.rows[0].gene.hgvsg}
                      </td>
                    </tr>
                    {group.rows.map((row, i) => {
                      const {
                        protein,
                        gene,
                        significances,
                        variation,
                      } = row;

                      if (
                        !showAllIsoforms
                        && !protein.canonical
                        && openGroup !== group.key
                      ) {
                        return null;
                      }

                      const proteinPosition = (protein.start === protein.end)
                        ? protein.start
                        : `${protein.start}-${protein.end}`;

                      const geneLocation = (gene.start === gene.end)
                        ? `${gene.chromosome}:g.${gene.start}`
                        : `${gene.chromosome}:${gene.start}-${gene.end}`;

                      const rowKey = `${group.key}-${i}`;

                      let detailsPageLink = null;

                      if (protein.start && protein.variant) {
                        const varSTRes = protein.variant
                          .split('/')
                          .join(protein.start.toString());

                        const detailsPageURL = `https://www.ebi.ac.uk/thornton-srv/databases/cgi-bin/DisaStr/GetPage.pl?uniprot_acc=${protein.accession.toUpperCase()}&template=resreport.html&res=${varSTRes}`;
                        detailsPageLink = (
                          <a
                            className="details-page-link"
                            href={detailsPageURL}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Details
                          </a>
                        );
                      }

                      let { accession } = protein;

                      if (protein.canonical) {
                        accession = protein.canonicalAccession;
                      } else if (protein.isoform) {
                        accession = protein.isoform;
                      }

                      significances.transcript
                        .forEach((t) => {
                          t.hgvsg = gene.hgvsg;
                          t.hgvsp = gene.hgvsp;
                          t.canonical = protein.canonical;
                          t.codons = gene.codons;
                          t.aminoAcids = protein.variant;
                          t.enspId = protein.ensp;
                          t.enstId = gene.enstId;
                          t.ensgId = gene.ensgId;
                          t.start = protein.start;
                          t.end = protein.end;
                          t.cosmicId = variation.cosmicId;
                          t.dbSNPId = variation.dbSNPId;
                          t.clinVarIDs = variation.clinVarIDs;
                          t.uniProtVariationId = variation.uniProtVariationId;
                          t.colocatedVariantsCount = variation.proteinColocatedVariantsCount;
                          t.redundantENSTs = gene.redundantENSTs;
                          t.diseaseColocatedVariantsCount = variation
                            .diseasAssociatedProteinColocatedVariantsCount;
                        });

                      if (typeof significances.structural !== 'undefined') {
                        significances.structural.position = protein.start;
                        significances.structural.accession = accession;
                      }

                      if (typeof significances.clinical !== 'undefined') {
                        significances.clinical.colocatedVariantsCount = variation
                          .proteinColocatedVariantsCount;

                        significances.clinical.diseaseColocatedVariantsCount = variation
                          .diseasAssociatedProteinColocatedVariantsCount;
                      }

                      const caddColour = (significances.transcript[0].caddPhred <= 30)
                        ? 'green'
                        : 'red';

                      counter += 1;

                      const noSignificance = <span className="no-significances">-</span>;

                      const transcriptSignificancesButton = (
                        <Button
                          onClick={() => this.toggleSignificanceRow(rowKey, 'transcript')}
                          className="button--significances button--transcript"
                        >
                          T
                        </Button>
                      );

                      const functionalSignificancesButton = (
                        <Button
                          onClick={() => this.toggleSignificanceRow(rowKey, 'functional')}
                          className="button--significances button--positional"
                        >
                          F
                        </Button>
                      );

                      const clinicalSignificancesButton = (
                        <Button
                          onClick={() => this.toggleSignificanceRow(rowKey, 'clinical')}
                          className="button--significances button--clinical"
                        >
                          C
                        </Button>
                      );

                      const structuralSignificancesButton = (
                        <Button
                          onClick={() => this.toggleSignificanceRow(rowKey, 'structural')}
                          className="button--significances button--structural"
                        >
                          S
                        </Button>
                      );

                      const genomicSignificancesButton = (
                        <Button
                          onClick={() => this.toggleSignificanceRow(rowKey, 'genomic')}
                          className="button--significances button--genomic"
                        >
                          G
                        </Button>
                      );

                      return (
                        <Fragment key={`${rowKey}-${counter}`}>
                          <tr key={rowKey}>
                            <td>
                              {(significances.transcript && significances.transcript[0].caddPhred)
                                ? (
                                  <span
                                    className={`label warning cadd-score cadd-score--${caddColour}`}
                                    title={`Likely ${(significances.transcript[0].caddPhred < 30) ? 'Benign' : 'Deleterious'}`}
                                  >
                                    {significances.transcript[0].caddPhred}
                                  </span>
                                ) : '-'
                              }
                            </td>
                            <td>{gene.symbol}</td>
                            <td>
                              {(protein.length && proteinPosition)
                                ? (
                                  <Fragment>
                                    <ProteinReviewStatus type={protein.type} />
                                    {accession}
                                  </Fragment>
                                ) : '-'
                              }
                            </td>
                            <td>{proteinPosition || '-'}</td>
                            <td>
                              <span title={protein.variant || '-'}>{protein.threeLetterCodes || '-'}</span>
                            </td>
                            <td>{geneLocation}</td>
                            <td>{gene.allele}</td>
                            <td>{group.rows[0] && group.rows[0].variation.dbSNPId}</td>
                            <td className="fit">
                              {significances.clinical
                                ? clinicalSignificancesButton
                                : noSignificance
                              }
                            </td>
                            <td className="fit">
                              {significances.genomic
                                ? genomicSignificancesButton
                                : noSignificance
                              }
                            </td>
                            <td className="fit">
                              {significances.transcript
                                ? transcriptSignificancesButton
                                : noSignificance
                              }
                            </td>
                            <td className="fit">
                              {significances.functional
                                ? functionalSignificancesButton
                                : noSignificance
                              }
                            </td>
                            <td className="fit">
                              {significances.structural
                                ? structuralSignificancesButton
                                : noSignificance
                              }
                            </td>
                          </tr>

                          {(`${rowKey}:functional` === expandedRow)
                            ? (
                              <ExpandedFunctionalSignificance
                                data={significances.functional}
                                variation={variation}
                                detailsLink={detailsPageLink}
                              />
                            ) : null }

                          {(`${rowKey}:clinical` === expandedRow)
                            ? (
                              <ExpandedClinicalSignificance
                                data={significances.clinical}
                                variation={variation}
                                detailsLink={detailsPageLink}
                              />
                            ) : null }

                          {(`${rowKey}:transcript` === expandedRow)
                            ? (
                              <ExpandedTranscriptSignificance
                                data={significances.transcript}
                                variation={variation}
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

                          {(`${rowKey}:genomic` === expandedRow)
                            ? (
                              <ExpandedGenomicSignificance
                                data={significances.genomic}
                                variation={variation}
                                detailsLink={detailsPageLink}
                                gene={gene}
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
  rows: PropTypes.objectOf(PropTypes.shape({
    key: PropTypes.string,
    input: PropTypes.string,
    rows: PropTypes.arrayOf(PropTypes.shape({
      gene: PropTypes.shape({
        hgvsg: PropTypes.string,
      }),
      variation: PropTypes.shape({
        dbSNPId: PropTypes.string,
      }),
      map: PropTypes.func,
    })),
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
    }),
    protein: PropTypes.shape({
      accession: PropTypes.string,
      isoform: PropTypes.string,
      canonical: PropTypes.bool,
      canonicalAccession: PropTypes.string,
      end: PropTypes.number,
      length: PropTypes.number,
      name: PropTypes.shape({
        full: PropTypes.string,
        short: PropTypes.string,
      }),
      start: PropTypes.number,
      threeLetterCodes: PropTypes.string,
      variant: PropTypes.string,
      enspId: PropTypes.string,
    }),
    significances: PropTypes.shape({}),
  })),
  handleDownload: PropTypes.func.isRequired,
};

ImpactSearchResults.defaultProps = {
  rows: {},
};

export default ImpactSearchResults;
