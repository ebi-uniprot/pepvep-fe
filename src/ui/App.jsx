import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, withRouter } from 'react-router-dom';
// import axios from 'axios';
import axios, { post } from 'axios';
import PapaParse from 'papaparse';

import gql from 'graphql-tag';
import { ApolloClient, client, InMemoryCache, ApolloProvider } from '@apollo/client';

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
			file: {},
			isFileSelected: false,
			page: {}
		};
	}

	getQuery() {
		var query = gql`
			query pepvepvariant($params: [String!]) {
				pepvepvariant(pepVepInputs: $params) {
					input
					variants {
						errors {
							title
							message
						}
						structureEndpoint
						gene {
							ensgId
							chromosome
							symbol
							source
							enstId
							ensgId
							allele
							start
							end
							exon
							strand
							hgvsg
							hgvsp
							hgncId
						}
						protein {
							hgncId
							canonical
							accession
							name {
								full
								shortName
							}
							length
							type
							isoform
							canonicalAccession
							features {
								type
								typeDescription
								description
								category
								begin
								end
								evidences {
									code
									label
									source {
										name
										id
										url
										alternativeUrl
									}
								}
							}
						}
						variation {
							novel
							consequence
							variant
							threeLetterCodes
							begin
							end
							codons
							sourceType
							disease
							nonDisease
							uniprot
							largeScaleStudy
							uncertain
							xrefs {
								name
								id
								url
								alternativeUrl
								reviewed
							}
							ids {
								dbSNPId
								cosmicId
								clinVarIds {
									id
									pubMedIds
									allele
									gene
									mim
									phenotype
									url
								}
							}
							evidences {
								code
								label
								source {
									name
									id
									url
									alternativeUrl
								}
							}
							association {
								name
								description
								dbReferences {
									name
									id
									url
									alternativeUrl
								}
								evidences {
									code
									label
									source {
										name
										id
										url
										alternativeUrl
									}
								}
								disease
							}
							clinicalSignificances {
								type
								sources
							}
							predictions {
								predictionValType
								predAlgorithmNameType
								score
							}
							proteinColocatedVariants {
								begin
								end
								ids {
									dbSNPId
									clinVarIds {
										id
										pubMedIds
										allele
										gene
										mim
										phenotype
										url
									}
									cosmicId
								}
								clinicalSignificances {
									type
									sources
								}
								wildType
								alternativeSequence
								sourceType
								association {
									name
									description
									dbReferences {
										name
										id
										url
										alternativeUrl
										reviewed
									}
									disease
									evidences {
										code
										label
										source {
											name
											id
											url
											alternativeUrl
										}
									}
								}
							}
							genomicColocatedVariants {
								id
								pubMedIds
							}
							populationFrequencies {
								sourceName
								frequencies {
									label
									value
								}
							}
						}
					}
				}
			}
		`;
		return query;
	}

	createVariationDetails(variant) {
		var variationDetails = {};
		variationDetails.wildType = variant.variation.variant.split('/')[0];
		variationDetails.alternativeSequence = variant.variation.variant.split('/')[1];
		variationDetails.clinicalSignificances = this.getClinicalSignificance(variant.variation.clinicalSignificances);
		variationDetails.clinicalSignificance = this.getClinicalSignificanceStr(
			variant.variation.clinicalSignificances
		);
		variationDetails.sourceType = variant.variation.sourceType;
		variationDetails.association = variant.variation.association;
		variationDetails.xrefs = variant.variation.xrefs;
		variationDetails.polyphenScore = this.getPredictionScore(variant.variation.predictions, 'PolyPhen');
		variationDetails.polyphenPrediction = this.getPredictionType(variant.variation.predictions, 'PolyPhen');
		variationDetails.siftScore = this.getPredictionScore(variant.variation.predictions, 'SIFT');
		variationDetails.siftPrediction = this.getPredictionType(variant.variation.predictions, 'SIFT');
		variationDetails.disease = variant.variation.disease;
		variationDetails.nonDisease = variant.variation.nonDisease;
		variationDetails.uniprot = variant.variation.uniprot;
		variationDetails.largeScaleStudy = variant.variation.largeScaleStudy;
		variationDetails.uncertain = variant.variation.uncertain;
		variationDetails.ids = variant.variation.ids;
		variationDetails.begin = variant.variation.begin;
		variationDetails.end = variant.variation.end;
		return variationDetails;
	}

	getClinicalSignificance(clinicalSignificances) {
		var significances = [];
		clinicalSignificances.forEach((significance) => {
			significances.push(significance.type);
		});
		return significances;
	}

	getClinicalSignificanceStr(clinicalSignificances) {
		var significances = '';
		clinicalSignificances.forEach((significance) => {
			significances = significances + ',' + significance.type;
		});
		return significances;
	}

	getPredictionScore(predictions, algorithName) {
		var predScore = '';
		predictions.forEach((prediction) => {
			if (prediction.predAlgorithmNameType === algorithName) {
				predScore = prediction.score;
			}
		});
		return predScore;
	}

	getPredictionType(predictions, algorithName) {
		var predType = '';
		predictions.forEach((prediction) => {
			if (prediction.predAlgorithmNameType === algorithName) {
				predType = prediction.predictionValType;
			}
		});
		return predType;
	}

	createFunctionalSignificance(variant, variationDetails) {
		var functionalSignificance = {};
		functionalSignificance.features = variant.protein.features;
		functionalSignificance.variationDetails = variationDetails;
		// functionalSignificance.colocatedVariants = {};
		// functionalSignificance.colocatedVariantsEndpoint = variant.variation.proteinColocatedVariantsEndpoint;
		functionalSignificance.colocatedVariants = variant.variation.proteinColocatedVariants;
		return functionalSignificance;
	}

	createClinicalSignificance(variant, variationDetails) {
		var clinicalSignificance = {};
		if (variationDetails.clinicalSignificances !== undefined) {
			clinicalSignificance.categories = variationDetails.clinicalSignificances;
		}
		clinicalSignificance.association = variant.variation.association;
		// clinicalSignificance.colocatedVariants = {};
		// clinicalSignificance.colocatedVariantsEndpoint = variant.variation.proteinColocatedVariantsEndpoint;
		clinicalSignificance.colocatedVariants = variant.variation.proteinColocatedVariants;
		clinicalSignificance.variationDetails = variationDetails;
		clinicalSignificance.colocatedVariantsCount = variant.variation.proteinColocatedVariantsCount;
		clinicalSignificance.diseaseColocatedVariantsCount = variant.variation.diseaseAssociatedProtCVCount;
		return clinicalSignificance;
	}

	createTranscriptSignificance(variant, variationDetails) {
		var transcriptSignificances = [];
		var transcriptSignificance = {};
		var consequenceTerms = [];
		if (variant.variation.consequence !== undefined) {
			consequenceTerms.push(variant.variation.consequence);
		}
		transcriptSignificance.biotype = 'Protein Coding';
		transcriptSignificance.polyphenPrediction = variationDetails.polyphenPrediction;
		transcriptSignificance.polyphenScore = variationDetails.polyphenScore;
		transcriptSignificance.siftPrediction = variationDetails.siftPrediction;
		transcriptSignificance.siftScore = variationDetails.siftScore;
		transcriptSignificance.mostSevereConsequence = variant.variation.consequence;
		transcriptSignificance.consequenceTerms = consequenceTerms;
		transcriptSignificance.colocatedVariants = {};
		transcriptSignificance.colocatedVariantsEndpoint = variant.variation.proteinColocatedVariantsEndpoint;
		if (variationDetails.clinicalSignificances !== undefined) {
			transcriptSignificance.pathogenicity = variationDetails;
		}
		transcriptSignificance.variationDetails = variationDetails;
		transcriptSignificance.hgvsg = variant.gene.hgvsg;
		transcriptSignificance.hgvsp = variant.gene.hgvsp;
		transcriptSignificance.canonical = variant.protein.canonical;
		transcriptSignificance.codons = variant.variation.codons;
		transcriptSignificance.aminoAcids = variant.variation.variant;
		transcriptSignificance.enstId = variant.gene.enstId;
		transcriptSignificance.ensgId = variant.gene.ensgId;
		transcriptSignificance.start = variant.variation.begin;
		transcriptSignificance.end = variant.variation.end;
		transcriptSignificance.cosmicId = variant.variation.cosmicId;
		transcriptSignificance.dbSNPId = variant.variation.dbSNPId;
		transcriptSignificance.clinVarIds = variant.variation.clinVarIDs;
		transcriptSignificance.colocatedVariantsCount = variant.variation.proteinColocatedVariantsCount;
		transcriptSignificance.diseaseColocatedVariantsCount =
			variant.variation.diseaseAssociatedproteinColocatedVariantsCount;
		transcriptSignificance.redundantENSTs = variant.gene.redundantENSTs;
		transcriptSignificance.mutationTasterScore = '';
		transcriptSignificance.mutationTasterPrediction = '';
		transcriptSignificance.lrtPrediction = '';
		transcriptSignificance.lrtScore = 0.0;
		transcriptSignificance.caddPhred = 0.0;
		transcriptSignificances.push(transcriptSignificance);
		return transcriptSignificances;
	}

	createGenomicSignificance(variant, variationDetails) {
		var genomic = {};
		var consequencePrediction = {};
		consequencePrediction.polyphenPrediction = variationDetails.polyphenPrediction;
		consequencePrediction.polyphenScore = variationDetails.polyphenScore;
		consequencePrediction.siftPrediction = variationDetails.siftPrediction;
		consequencePrediction.siftScore = variationDetails.siftScore;
		consequencePrediction.caddPhred = 0.0;
		consequencePrediction.caddRaw = 0.0;

		genomic.consequencePrediction = consequencePrediction;
		genomic.variationDetails = variationDetails;
		genomic.populationFrequencies = variant.variation.populationFrequencies;
		return genomic;
	}

	createSignificances(variants) {
		var updateVariants = {
			errors: [],
			results: []
		};
		variants.forEach((variant) => {
			if (variant.errors !== undefined && variant.errors.length > 0) {
				updateVariants.errors = variant.errors;
			}
			if (variant.variation != null) {
				var significances = {};
				var updateVariant = {};
				var variationDetails = this.createVariationDetails(variant);

				significances.functional = this.createFunctionalSignificance(variant, variationDetails);
				significances.structural = {};
				significances.structureEndpoint = variant.structureEndpoint;
				significances.genomic = this.createGenomicSignificance(variant, variationDetails);
				significances.clinical = this.createClinicalSignificance(variant, variationDetails);
				significances.transcript = this.createTranscriptSignificance(variant, variationDetails);
				updateVariant.significances = significances;
				updateVariant.protein = variant.protein;
				updateVariant.gene = variant.gene;
				// updateVariant.variation = {};
				// updateVariant.variation.variationDetails = {};
				updateVariant.variation = variant.variation;
				// updateVariant.variation.variationDetails = variationDetails;
				updateVariants.results.push(updateVariant);
			}
		});
		return updateVariants;
	}

	handleSearch = (input, uploadedFile, newPage, loadingFlag) => {
		// console.log('Calling API -> ' + input);
		const { history } = this.props;

		const BASE_URL = 'http://localhost:8091/uniprot/api';
		// const BASE_URL = 'http://wwwdev.ebi.ac.uk/uniprot/api';

		var isFileSelectedNew = false;
		var loadingNew = true;
		if (uploadedFile && loadingFlag) {
			isFileSelectedNew = true;
			loadingNew = true;
		}
		if (uploadedFile && !loadingFlag) {
			isFileSelectedNew = true;
			loadingNew = false;
		}
		this.setState({
			isFileSelected: isFileSelectedNew,
			loading: loadingNew,
			page: newPage
		});

		var inputArr = input.split('\n');
		let inputType = this.getInputType(inputArr);

		if (inputType === 'hgvs') {
			this.fetchByHGVS(BASE_URL, inputArr, input, uploadedFile, newPage, history);
		} else if (inputType === 'vcf') {
			this.fetchByVCF(BASE_URL, inputArr, input, uploadedFile, newPage, history);
		}
	};

	createGenes(mapping) {
		var genes = [];
		var chr = mapping.chromosome;
		var start = mapping.geneCoordinateStart;
		var variant = mapping.variantAllele;
		var id = mapping.id;

		mapping.genes.forEach((gene) => {
			var rows = [];
			let ensg = gene.ensg;
			gene.isoforms.forEach((isoform) => {
				var record = {};
				if (isoform.canonical || isoform.canonicalAccession === null) {
					record.chromosome = chr;
					// record.position = start;
					record.id = id;
					record.refAllele = gene.refAllele;
					// record.altAllele = variant;
					record.geneName = gene.geneName;
					record.codon = isoform.refCodon + '/' + isoform.variantCodon;
					record.CADD = '-';
				}
				record.position = start;
				record.altAllele = variant;
				record.proteinName = isoform.proteinName;
				record.isoform = isoform.accession;
				record.aaPos = isoform.isoformPosition;
				record.aaChange = isoform.refAA + '/' + isoform.variantAA;
				record.consequences = isoform.consequences;
				record.cdsPosition = isoform.cdsPosition;
				record.canonical = isoform.canonical;
				record.canonicalAccession = isoform.canonicalAccession;
				record.referenceFunctionUri = isoform.referenceFunctionUri;
				record.ensp = [];
				record.enst = [];
				if (isoform.translatedSequences !== undefined && isoform.translatedSequences.length > 0) {
					var ensps = [];
					var ensts = [];
					isoform.translatedSequences.map((translatedSeq) => {
						ensps.push(translatedSeq.ensp);
						translatedSeq.transcripts.map((transcript) => {
							ensts.push(transcript.enst);
						});
					});
					record.ensp = ensps;
					record.enst = ensts;
					// isoform.translatedSequences.map;
					// if (
					// 	isoform.translatedSequences[0].transcripts !== undefined &&
					// 	isoform.translatedSequences[0].transcripts.length > 0
					// ) {
					// 	record.enst = isoform.translatedSequences[0].transcripts[0].enst;
					// }
				}
				record.ensg = ensg;
				record.functionLoaded = false;
				record.structureLoaded = false;
				record.variationLoaded = false;
				rows.push(record);
			});
			genes.push(rows);
		});
		if (genes.length === 0) {
			var rows = [];
			var record = {};
			record.chromosome = chr;
			record.position = start;
			record.id = id;
			record.refAllele = mapping.userAllele;
			record.altAllele = mapping.variantAllele;
			record.canonicalAccession = null;
			rows.push(record);
			genes.push(rows);
		}
		return genes;
	}

	getInputType(inputArr) {
		let firstInput = inputArr[0];
		if (firstInput.startsWith('NC')) {
			return 'hgvs';
		} else if (!isNaN(firstInput.split(' ')[0])) {
			return 'vcf';
		} else {
			return 'unknown input';
		}
	}

	fetchNextPage = (uploadedFile, page, isFileSelected, loading) => {
		var pageNumber = page.currentPage;
		const PAGE_SIZE = 200;
		var skipRecord = (pageNumber - 1) * PAGE_SIZE;
		var count = 0;
		var recordsProcessed = 0;
		var firstLine = true;
		var inputText = '';
		var newPage = {
			currentPage: page.currentPage,
			previousPage: page.previousPage,
			nextPage: false
		};
		// var numberOfLinesToRead = skipRecord + PAGE_SIZE;
		PapaParse.parse(uploadedFile, {
			// preview: numberOfLinesToRead,
			step: (row, parser) => {
				if (recordsProcessed >= PAGE_SIZE) {
					newPage = {
						currentPage: page.currentPage,
						previousPage: page.previousPage,
						nextPage: true
					};
					// this.handleSearch(inputText, uploadedFile, this.state.page, true);
					parser.abort();
				}
				if (!row.data[0].startsWith('#') && count > skipRecord) {
					recordsProcessed++;
					var newInput = this.createCsvString(row.data);
					if (newInput != '') {
						if (firstLine) {
							inputText += newInput;
							firstLine = false;
						} else {
							inputText += '\n' + newInput;
						}
					}
				} else {
					count++;
				}
			},
			complete: () => {
				this.setState({
					page: newPage,
					searchTerm: inputText,
					isFileSelected: isFileSelected,
					loading: loading
				});
				this.handleSearch(inputText, uploadedFile, this.state.page, loading);
			}
		});
	};

	fetchByVCF(BASE_URL, inputArr, input, uploadedFile, newPage, history) {
		const headers = {
			'Content-Type': 'application/json',
			Accept: '*'
		};

		const uri = BASE_URL + '/pepvep/variant/mapping';
		const output = {
			errors: [],
			results: {}
		};
		if (this.state.searchResults != null) {
			output.results = this.state.searchResults;
		}
		var mappings = [];
		post(uri, inputArr, {
			headers: headers
		}).then((response) => {
			console.log('response -> ' + response.data);
			response.data.forEach((mapping) => {
				var genes = this.createGenes(mapping);
				mappings.push(genes);
			});

			this.setState({
				searchTerm: inputArr,
				searchResults: mappings,
				errors: output.errors,
				loading: false,
				isFileSelected: false,
				file: uploadedFile,
				page: newPage
			});

			history.push('search');

			// this.processResponse(results, input, uploadedFile, newPage, history);
		});
	}

	fetchByHGVS(BASE_URL, inputArr, input, uploadedFile, newPage, history) {
		const headers = {
			'Content-Type': 'application/json'
		};

		const uri = BASE_URL + '/pepvep/variant/hgvs';
		const output = {
			errors: [],
			results: {}
		};
		if (this.state.searchResults != null) {
			output.results = this.state.searchResults;
		}
		post(uri, inputArr, {
			headers: headers
		}).then((response) => {
			response.data.variants.forEach((variants) => {
				var updatedVariants = this.createSignificances(variants);

				updatedVariants.results.forEach((variant) => {
					let key = variant.gene.hgvsg;
					var existingVar = output.results[key];
					if (existingVar !== undefined) {
						existingVar.rows.push(variant);
						output.results[key] = {
							key: key,
							input: key,
							rows: existingVar.rows
						};
					} else {
						let newRows = [];
						newRows.push(variant);
						output.results[key] = {
							key: key,
							input: key,
							rows: newRows
						};
					}
				});
			});

			this.setState({
				searchTerm: input,
				searchResults: output.results,
				errors: output.errors,
				loading: false,
				isFileSelected: false,
				file: uploadedFile,
				page: newPage
			});

			history.push('search');

			// this.processResponse(results, input, uploadedFile, newPage, history);
		});
	}

	fetchByVCF1(BASE_URL, inputArr, input, uploadedFile, newPage, history) {
		const GET_VARIANTS = this.getQuery();
		const client = new ApolloClient({
			cache: new InMemoryCache(),
			uri: BASE_URL + '/pepvep/graphql'
		});
		var errorFlag = false;
		client
			.query({
				query: GET_VARIANTS,
				variables: { params: inputArr }
			})
			.catch((e) => {
				console.log('Got an axios error:', e);
				errorFlag = true;
			})
			.then((results) => {
				if (errorFlag) {
					this.setState({
						loading: false
					});
					history.push('api-error');
				} else {
					this.processResponse(results, input, uploadedFile, newPage, history);
				}
			});
	}

	processResponse(results, input, uploadedFile, newPage, history) {
		const output = {
			errors: [],
			results: {}
		};
		if (this.state.searchResults != null) {
			output.results = this.state.searchResults;
		}
		results.data.pepvepvariant.forEach((element) => {
			if (element.variants.length > 0) {
				var sortedVariants = [];
				var topRow = element.variants.filter(
					(variant) => variant.protein.canonicalAccession === variant.protein.accession
				);
				var otherRows = element.variants.filter(
					(variant) => variant.protein.accession !== variant.protein.canonicalAccession
				);
				if (otherRows !== undefined || otherRows.length > 0) {
					sortedVariants = topRow.concat(otherRows);
				} else {
					sortedVariants = topRow;
				}
				var updatedVariants = this.createSignificances(sortedVariants);
				output.errors = output.errors.concat(updatedVariants.errors);
				output.results[element.input] = {
					key: element.input,
					input: element.input,
					rows: updatedVariants.results
				};
			}
		});

		this.setState({
			searchTerm: input,
			searchResults: output.results,
			// searchResults: [ ...this.state.searchResults, ...output.results ],
			errors: output.errors,
			loading: false,
			isFileSelected: false,
			file: uploadedFile,
			page: newPage
		});

		history.push('search');
	}

	createCsvString(rowArr) {
		if (rowArr == '' || rowArr.length < 5) {
			return '';
		}
		// var cols = line.split('\t');
		var pos = rowArr[1].split('_');
		var start = pos[0];
		var end = pos[0];
		if (pos.length > 1) {
			end = pos[1];
		}
		return rowArr[0] + ' ' + start + ' ' + end + ' ' + rowArr[3] + '/' + rowArr[4] + ' ' + '. . .';
	}

	getCSVRow(input, variant) {
		var isAssociatedDisease = 'No';
		var allStructures = '';
		var diseaseDetails = '';
		var featureDetails = '';
		var variationDetails = this.createVariationDetails(variant);
		if (variant.significances.clinical.association.length > 0) {
			isAssociatedDisease = 'Yes';
			variant.significances.clinical.association.forEach((disease) => {
				diseaseDetails += `disease=${disease.disease}`;
				diseaseDetails += disease.name ? `,name=${disease.name.replace(/,/gi, '')}` : '';
				diseaseDetails += disease.description ? `,description=${disease.description.replace(/,/gi, '')}` : '';
				const diseaseEvidences = [];
				disease.evidences.forEach((diseaseEvidence) => {
					diseaseEvidences.push(`${diseaseEvidence.source.name}:${diseaseEvidence.source.id}`);
				});

				if (diseaseEvidences.length) {
					diseaseDetails += `,evidences=${diseaseEvidences.join(';')}`;
				}
				diseaseDetails += ',';
			});
		}

		if (
			variant.significances.functional != null &&
			variant.significances.functional.features != null &&
			variant.significances.functional.features.length > 0
		) {
			variant.significances.functional.features.forEach((feature) => {
				featureDetails += `type=${feature.type}`;
				featureDetails += `,category=${feature.category}`;
				featureDetails += feature.description ? `,description=${feature.description.replace(/,/gi, '')}` : '';
				featureDetails += `,start=${feature.begin}`;
				featureDetails += `,end=${feature.end}`;

				if (feature.evidences != null && feature.evidences.length > 0) {
					const featureEvidences = [];
					feature.evidences.forEach((featureEvidence) => {
						featureEvidences.push(`${featureEvidence.source.name}:${featureEvidence.source.id}`);
					});

					if (featureEvidences.length > 0) {
						featureDetails += `,evidences=${featureEvidences.join(';')}`;
					}
				}
				featureDetails += '|';
			});
		}

		var ligands = '';
		var interactions = '';
		if (variant.significances.structural != null) {
			if (
				variant.significances.structural.ligands != undefined &&
				Object.keys(variant.significances.structural.ligands).length > 0
			) {
				variant.significances.structural.ligands.forEach((ligandObject) => {
					let result = [];

					// if (variation.threeLetterAminoAcidBase.toUpperCase() !== ligandObject.position_code) {
					// 	return output;
					// }

					ligandObject.ligands.forEach((ligand) => {
						const ligandSerilised = [
							`id:${ligand.ligand_id}`,
							`formula:${ligand.formula}`,
							`InChi:${ligand.InChi}`,
							`ligand_name:${ligand.ligand_name}`
						].join(',');

						result.push(ligandSerilised);
					});

					ligands += result.join('|') + ';';
				}, '');
			}

			if (
				variant.significances.structural.interactions != undefined &&
				variant.significances.structural.interactions.length > 0
			) {
				variant.significances.structural.interactions.forEach((interaction) => {
					// if (variation.threeLetterAminoAcidBase.toUpperCase() !== interaction.position_code) {
					// 	return output;
					// }
					var partner_name = '';
					interaction.partners.forEach((partner) => {
						partner_name += partner.name + ',';
					});
					interactions += partner_name + '|';
				}, '');
			}

			if (variant.significances.structural.allStructures != null) {
				allStructures = Object.keys(variant.significances.structural.allStructures).join(',');
			}
		}
		// if (
		// 	variant.variation.proteinColocatedVariantsEndpoint != 'undefined' &&
		// 	variant.variation.proteinColocatedVariantsEndpoint.length > 0
		// ) {
		// 	var colocated_variants = '';
		// 	variant.variation.proteinColocatedVariants.forEach((cv) => {
		// 		colocated_variants +=
		// 			[
		// 				`alternative_sequence:${cv.alternativeSequence}`,
		// 				`clinical_significances:${cv.clinicalSignificances}`,
		// 				`disease:${cv.disease ? 1 : 0}`,
		// 				`large_scale_study:${cv.largeScaleStudy}`,
		// 				`polyphen_score:${cv.polyphenScore}`,
		// 				`sift_score:${cv.siftScore}`,
		// 				`source_type:${cv.sourceType}`,
		// 				`uniprot:${cv.uniprot}`,
		// 				`wildType:${cv.wildType}`
		// 			].join(',') + '|';
		// 	});
		// }

		return (
			'"' +
			input +
			'","' +
			variant.variation.consequence +
			'","' +
			'GRCh38' +
			'","' +
			variant.gene.chromosome +
			'","' +
			variant.gene.start +
			'","' +
			variant.gene.end +
			'","' +
			variant.gene.allele +
			'","' +
			variant.gene.allele.split('/')[1] +
			'","' +
			variant.gene.symbol +
			'","' +
			variant.gene.source +
			'","' +
			variant.protein.hgncId + // HGNC ID
			'","' +
			variant.gene.ensgId +
			'","' +
			variant.gene.enstId +
			'","' +
			variant.gene.hgvsp +
			'","' +
			'Protein Coding' + // BioType
			'","' +
			// 'Moderate' + // IMPACT
			// '","' +
			variant.variation.consequence + // CONSEQUENCE_TERMS
			'","' +
			variant.protein.accession +
			'","' +
			variant.variation.begin +
			'","' +
			variant.variation.end +
			'","' +
			allStructures +
			'","' +
			ligands + // LIGANDS
			'","' +
			interactions + // STRUCTURAL_INTERACTION_PARTNERS
			'","' +
			variant.variation.variant +
			'","' +
			isAssociatedDisease +
			'","' +
			variationDetails.clinicalSignificance +
			'","' +
			variationDetails.polyphenPrediction +
			'","' +
			variationDetails.polyphenScore +
			'","' +
			variationDetails.siftPrediction +
			'","' +
			variationDetails.siftScore +
			'","' +
			variant.gene.strand +
			'","' +
			variant.gene.exon +
			'","' +
			variant.gene.enstId +
			'","' +
			variant.gene.hgvsp +
			'","' +
			variant.gene.hgvsg +
			'","' +
			diseaseDetails +
			'","' +
			featureDetails +
			// '","' +
			// colocated_variants +
			'"\n'
		);
	}
	handleDownload = () => {
		const { searchTerm, searchResults } = this.state;
		var inputArr = searchTerm.split('\n');
		var outputCsv =
			'INPUT,MOST_SEVERE_CONSEQUENCE,ASSEMBLY,CHROMOSOME,' +
			'GENOMIC_START,GENOMIC_END,ALLELE_STRING,VARIANT_ALLELE,' +
			'GENE_SYMBOL,GENE_SYMBOL_SOURCE,' +
			'HGNC_ID,' +
			'GENE_ID,TRANSCRIPT_ID,TRANSLATION_ID,' +
			'BIOTYPE,' +
			// IMPACT,' +
			'CONSEQUENCE_TERMS,UNIPROT_ACCESSIONS,' +
			// 'TREMBL_ACCESSIONS,' +
			'PROTEIN_START,PROTEIN_END,STRUCTURES,LIGANDS,' +
			'STRUCTURAL_INTERACTION_PARTNERS,AMINO_ACID_CHANGE,ASSOCIATED_TO_DISEASE,' +
			'DISEASE_CATEGORIES,POLYPHEN_PREDICTION,POLYPHEN_SCORE,' +
			// 'MUTATION_TASTER_PREDICTION,MUTATION_TASTER_SCORE,LRT_PREDICTION,LRT_SCORE,FATHMM_PREDICTION,' +
			// 'FATHMM_SCORE,PROVEAN_PREDICTION,PROVEAN_SCORE,CADD_RAW,CADD_PHRED,' +
			'SIFT_PREDICTION,SIFT_SCORE,' +
			// 'MUTPRED_SCORE,BLOSUM62,APPRIS,TSL,STRAND,CODONS,CDNA_START,CDNA_END,CDS_START,CDS_END,EXON,UNIPARC_ACCESSIONS,' +
			'STRAND,EXON,HGVS_C,HGVS_P,HGVS_G,DISEASE_ASSOCIATIONS,PROTEIN_ANNOTATIONS\n';
		// COLOCATED_VARIANTS

		Object.keys(searchResults).forEach((inputStr) => {
			searchResults[inputStr].rows.forEach((variant) => {
				if (variant.variation != null) {
					outputCsv = outputCsv + this.getCSVRow(inputStr, variant);
				}
			});
		});
		const url = window.URL.createObjectURL(new Blob([ outputCsv ]));
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', 'pepvep-data.csv'); // or any other extension
		document.body.appendChild(link);
		link.click();
	};

	handleBulkDownload = (e, file) => {
		// const BASE_URL = 'http://localhost:8091/uniprot/api';
		const BASE_URL = 'http://wwwdev.ebi.ac.uk/uniprot/api';
		this.fileUpload(file).then((response) => {
			console.log('File uploaded successfully ', response);
			let a = document.createElement('a');
			a.href = BASE_URL + '/pepvep/variant/download/' + response.data + '/';
			a.download = 'pepvep.zip';
			a.click();
		});
	};

	fileUpload(file) {
		// const BASE_URL = 'http://localhost:8091/uniprot/api/pepvep/variant/upload';
		const BASE_URL = 'http://wwwdev.ebi.ac.uk/uniprot/api/pepvep/variant/upload';
		const formData = new FormData();
		formData.append('file', file);
		const config = {
			headers: {
				'content-type': 'multipart/form-data'
			}
		};
		return post(BASE_URL, formData, config);
	}

	render() {
		const appProps = {
			...this.state,
			handleSearch: this.handleSearch,
			handleDownload: this.handleDownload,
			fetchNextPage: this.fetchNextPage,
			handleBulkDownload: this.handleBulkDownload
		};

		return (
			<Switch>
				<Route path={`${BASE_URL}/`} exact render={() => <HomePage {...appProps} />} />
				<Route path={`${BASE_URL}/search`} render={() => <SearchResultsPage {...appProps} />} />
				<Route path={`${BASE_URL}/api-error`} render={() => <APIErrorPage {...appProps} />} />
				<Route
					component={({ location }) => (
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
		push: PropTypes.func
	}).isRequired
};

export default withRouter(App);
