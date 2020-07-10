import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProtvistaStructure from 'protvista-structure';

import StructuralPosition from '../other/StructuralPosition';
import {
  detailsLinkPropTypes,
  detailsLinkDefaultProps,
} from '../../other/sharedProps';

class ExpandedStructuralSignificance extends Component {
  constructor(props) {
    super(props);

    this.state = {
      structure: null,
    };

    if (!window.customElements.get('protvista-structure')) {
      window.customElements.define('protvista-structure', ProtvistaStructure);
    }
  }

  structureChange = ({ target }) => {
    this.setState({
      structure: target.value,
    });
  };

  render() {
    const { structure } = this.state;
    const { data, detailsLink } = this.props;
    const {
      structures,
      allStructures,
      proteinLength,
      interactions,
      ligands,
      position,
      accession,
    } = data;

    // Maps to hold key-value information
    const relatedLigands = {};
    const unrelatedLigands = {};
    const relatedInteractions = {};
    const unrelatedInteractions = {};

    // Array of values, to be extracted from the key-value pairs
    // for ease of use
    let unrelatedLigandsValues = [];
    let relatedLigandsValues = [];
    let relatedInteractionsValues = [];
    let unrelatedInteractionsValues = [];

    Object.keys(allStructures)
      .forEach((pdbeId) => {
        allStructures[pdbeId]
          .forEach((currentStructure) => {
            const [start, end] = currentStructure.residue_range
              .split('-');

            currentStructure.start = parseInt(start, 10);
            currentStructure.end = parseInt(end, 10);
          });
      });

    const bestStructures = structures
      .reduce((all, current) => all.concat(current.best_structures), []);

    const allLigands = ligands
      .reduce((all, current) => all.concat(current.ligands), []);

    const allInteractions = interactions
      .reduce((all, current) => all.concat(current.partners), []);

    const currentStructure = (!structure && bestStructures.length > 0)
      ? bestStructures[0]
      : structure;

    if (structure === null && bestStructures.length === 0) {
      return null;
    }

    const currentStructureDetails = allStructures[currentStructure][0];

    allLigands
      .forEach((ligand) => {
        // eslint-disable-next-line
        const { ligand_id, structures } = ligand;

        if (relatedLigands[ligand_id] || unrelatedLigands[ligand_id]) {
          return;
        }

        if (structures.includes(currentStructure)) {
          relatedLigands[ligand_id] = ligand;
        } else {
          unrelatedLigands[ligand_id] = ligand;
        }
      });

    allInteractions
      .forEach((interaction) => {
        // eslint-disable-next-line
        const { partner_accession, structures } = interaction;
        const partnerAccessionUpppercased = partner_accession.toUpperCase();

        // 'DNA', 'RNA' and 'Other' are non-unique generic keys
        // so just collect the structure ids and append to the list.
        if (['DNA', 'RNA', 'OTHER'].includes(partnerAccessionUpppercased)) {
          if (structures.includes(currentStructure)) {
            if (!relatedInteractions[partnerAccessionUpppercased]) {
              relatedInteractions[partnerAccessionUpppercased] = interaction;
              return;
            }

            relatedInteractions.structures.push(...interaction.structures);
          } else {
            if (!unrelatedInteractions[partnerAccessionUpppercased]) {
              unrelatedInteractions[partnerAccessionUpppercased] = interaction;
              return;
            }

            unrelatedInteractions[partnerAccessionUpppercased]
              .structures.push(...interaction.structures);
          }
        }

        if (relatedInteractions[partner_accession] || unrelatedInteractions[partner_accession]) {
          return;
        }

        if (structures.includes(currentStructure)) {
          relatedInteractions[partner_accession] = interaction;
        } else {
          unrelatedInteractions[partner_accession] = interaction;
        }
      });

    relatedLigandsValues = Object.values(relatedLigands);
    unrelatedLigandsValues = Object.values(unrelatedLigands);
    relatedInteractionsValues = Object.values(relatedInteractions);
    unrelatedInteractionsValues = Object.values(unrelatedInteractions);

    return (
      <tr>
        <td colSpan="16">
          <span className="expanded-section-title">Structural Impact</span>
          {detailsLink}

          <div className="significances-groups">
            <div className="column">
              <i className="icon icon-functional structural-icon" data-icon="4" />
              <div><b>3D Visualisation</b></div>
              <protvista-structure
                accession={accession}
                molecule={currentStructure}
                height="200px"
                hide-viewport-controls
                hide-table
              />

              <StructuralPosition
                proteinLength={proteinLength}
                position={position}
                structureStart={currentStructureDetails.start}
                structureEnd={currentStructureDetails.end}
              />
              <span
                className="structure-position-help-text"
              >
                The blue bar represents the full protein sequence and the green
                pointer represents variant location.
              </span>
            </div>

            <div className="column">
              <i className="icon icon-conceptual summary-icon structural-icon" data-icon="s" />
              <div>
                <b>
                  Structures (
                  {bestStructures.length}
                  )
                </b>
              </div>
              {(bestStructures.length > 0) && (
              <select multiple size="5" onChange={e => this.structureChange(e)}>
                {bestStructures
                  .map(s => <option key={`best-structure-${s}`} value={s}>{s}</option>)
                }
                ;
              </select>
              )}
            </div>

            <div className="column">
              <i className="icon icon-conceptual summary-icon structural-icon" data-icon="b" />
              <div>
                <b>
                  {(relatedLigandsValues.length > 0)
                    ? `Related Ligands (${relatedLigandsValues.length})`
                    : 'No Related Ligands'
                  }
                </b>
              </div>
              {(relatedLigandsValues.length > 0) && (
              <ul data-columns="2">
                {relatedLigandsValues.map(l => <li key={l.ligand_name}>{`${l.ligand_name} [${l.ligand_id}]`}</li>)}
              </ul>
              )}

              <div>
                <b>
                  {(unrelatedLigandsValues.length > 0)
                    ? `Other Ligands (${unrelatedLigandsValues.length})`
                    : 'No Other Ligands'
                  }
                </b>
              </div>
              {(unrelatedLigandsValues.length > 0) && (
              <ul data-columns="2">
                {unrelatedLigandsValues.map(l => <li key={l.ligand_name}>{`${l.ligand_name} [${l.ligand_id}]`}</li>)}
              </ul>
              )}
            </div>

            <div className="column">
              <i className="icon icon-conceptual summary-icon structural-icon" data-icon="y" />
              <div>
                <b>
                  {(relatedInteractionsValues.length > 0)
                    ? `Related Interactions (${relatedInteractionsValues.length})`
                    : 'No Related Interactions'
                  }
                </b>
              </div>
              {(relatedInteractionsValues.length > 0) && (
              <ul data-columns="2">
                {relatedInteractionsValues.map(i => <li key={i.partner_name}>{`${i.partner_name} [${i.partner_accession}]`}</li>)}
              </ul>
              )}

              <div>
                <b>
                  {(unrelatedInteractionsValues.length > 0)
                    ? `Other Interactions (${unrelatedInteractionsValues.length})`
                    : 'No Other Interactions'
                  }
                </b>
              </div>
              {(unrelatedInteractionsValues.length > 0) && (
              <ul data-columns="2">
                {unrelatedInteractionsValues.map(i => <li key={i.partner_name}>{`${i.partner_name} [${i.partner_accession}]`}</li>)}
              </ul>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  }
}

ExpandedStructuralSignificance.propTypes = {
  data: PropTypes.shape({
    accession: PropTypes.string,
    position: PropTypes.number,
    proteinLength: PropTypes.number,
    allStructures: PropTypes.objectOf(PropTypes.arrayOf(
      PropTypes.shape({
        chain_id: PropTypes.string,
        entity_id: PropTypes.string,
        residue_range: PropTypes.string,
        start: PropTypes.number,
        end: PropTypes.number,
      }),
    )),
    annotations: PropTypes.arrayOf(PropTypes.shape({
      count_data_resource: PropTypes.number,
      data_resource: PropTypes.arrayOf(PropTypes.string),
      position: PropTypes.number,
      position_code: PropTypes.string,
    })),
    interactions: PropTypes.arrayOf(PropTypes.shape({
      count_partners: PropTypes.number,
      partners: PropTypes.arrayOf(PropTypes.shape({
        partner_accession: PropTypes.string,
        partner_name: PropTypes.string,
        structures: PropTypes.arrayOf(PropTypes.string),
      })),
      position: PropTypes.number,
      position_code: PropTypes.string,
    })),
    ligands: PropTypes.arrayOf(PropTypes.shape({
      count_ligands: PropTypes.number,
      ligands: PropTypes.arrayOf(PropTypes.shape({
        InChi: PropTypes.string,
        formula: PropTypes.string,
        ligand_id: PropTypes.string,
        ligand_name: PropTypes.string,
      })),
      position: PropTypes.number,
      position_code: PropTypes.string,
      structures: PropTypes.arrayOf(PropTypes.string),
    })),
    structures: PropTypes.arrayOf(PropTypes.shape({
      count_best_structures: PropTypes.number,
      best_structures: PropTypes.arrayOf(PropTypes.string),
      position: PropTypes.number,
      position_code: PropTypes.string,
    })),
  }),
  detailsLink: detailsLinkPropTypes,
};

ExpandedStructuralSignificance.defaultProps = {
  data: {},
  detailsLink: detailsLinkDefaultProps,
};

export default ExpandedStructuralSignificance;
