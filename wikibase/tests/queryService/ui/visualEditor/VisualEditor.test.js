( function ( $, QUnit, sinon, wb ) {
	'use strict';

	QUnit.module( 'wikibase.queryService.ui.visualEditor' );

	var TEST_CASES = [
			{
				name: 'Cat query',
				sparqlIn: 'SELECT ?item ?itemLabel WHERE { ?item wdt:P31 wd:Q146 . SERVICE wikibase:label { bd:serviceParam wikibase:language "en" } }',
				sparqlOut: 'SELECT ?item ?itemLabel WHERE {\n  ?item wdt:P31 wd:Q146.\n  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }\n}',
				text: 'Find instance of cat  Show Limit'
			},
			{
				name: 'Any cat query',
				sparqlIn: 'SELECT ?item ?itemLabel WHERE { ?item wdt:P31* wd:Q146 . SERVICE wikibase:label { bd:serviceParam wikibase:language "en" } }',
				sparqlOut: 'SELECT ?item ?itemLabel WHERE {\n  ?item wdt:P31* wd:Q146.\n  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }\n}',
				text: 'Find  any instance of cat  Show Limit'
			},
			{
				name: 'Subtype cat query',
				sparqlIn: 'SELECT * WHERE {?c  p:P31/ps:P31 wd:Q146 .}',
				sparqlOut: 'SELECT * WHERE { ?c (p:P31/ps:P31) wd:Q146. }',
				text: 'Find instance of or subtype instance of cat  Show Limit'
			},
			{
				name: 'List of presidents with causes of death',
				sparqlIn: 'SELECT ?h ?cause ?hl ?causel WHERE { ?h wdt:P39 wd:Q11696 . ?h wdt:P509 ?cause . OPTIONAL {    ?h rdfs:label ?hl filter (lang(?hl) = "en") . } OPTIONAL {   ?cause rdfs:label ?causel filter (lang(?causel) = "en").  }}',
				sparqlOut: 'SELECT ?h ?cause ?hl ?causel WHERE {\n  ?h wdt:P39 wd:Q11696.\n  ?h wdt:P509 ?cause.\n  OPTIONAL {\n    ?h rdfs:label ?hl.\n    FILTER((LANG(?hl)) = \"en\")\n  }\n  OPTIONAL {\n    ?cause rdfs:label ?causel.\n    FILTER((LANG(?causel)) = \"en\")\n  }\n}',
				text: 'Find position held President of the United States of America  Show cause of death Limit'
			},
			{
				name: 'List of actors with pictures with year of birth and/or death',
				sparqlIn: 'SELECT ?human ?humanLabel ?yob ?yod ?picture WHERE{ ?human wdt:P31 wd:Q5 ; wdt:P106 wd:Q33999 . ?human wdt:P18 ?picture . OPTIONAL { ?human wdt:P569 ?dob . ?human wdt:P570 ?dod }. BIND(YEAR(?dob) as ?yob) . BIND(YEAR(?dod) as ?yod) . SERVICE wikibase:label {  bd:serviceParam wikibase:language "en" . }}LIMIT 88',
				sparqlOut: 'SELECT ?human ?humanLabel ?yob ?yod ?picture WHERE {\n  ?human wdt:P31 wd:Q5.\n  ?human wdt:P106 wd:Q33999.\n  ?human wdt:P18 ?picture.\n  OPTIONAL {\n    ?human wdt:P569 ?dob.\n    ?human wdt:P570 ?dod.\n  }\n  BIND(YEAR(?dob) AS ?yob)\n  BIND(YEAR(?dod) AS ?yod)\n  SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\". }\n}\nLIMIT 88',
				text: 'Find instance of cat  with occupation actor  Show image Limit 88'
			}
	];

	var LABELS = {
		P18: 'image',
		P569: 'date of birth',
		P570: 'date of birth',
		P31: 'instance of',
		P39: 'position held',
		P509: 'cause of death',
		P106: 'occupation',
		Q146: 'cat',
		Q5: 'cat',
		Q11696: 'President of the United States of America',
		Q33999: 'actor'
	};

	QUnit.test( 'When instantiating VisualEditor there should be no error ', function ( assert ) {
		assert.expect( 2 );
		var ve = new wb.queryService.ui.visualEditor.VisualEditor();

		assert.ok( true, 'Instantiating must not throw an error' );
		assert.ok( ( ve instanceof wb.queryService.ui.visualEditor.VisualEditor ),
				'Instantiating must not throw an error' );
	} );

	$.each( TEST_CASES, function ( index, testCase ) {
		QUnit.test( 'When setting SPARQL  \'' + testCase.name
				+ '\' query to VisualEditor then there should be the expected outcome', function (
				assert ) {
			assert.expect( 2 );

			var api = new wb.queryService.api.Wikibase();
			sinon.stub( api, 'searchEntities', function ( id ) {
				var label = id;
				if ( LABELS[id] ) {
					label = LABELS[id];
				}
				return $.Deferred().resolve( {
					search: [ {
						label: label,
						id: id,
						description: 'DESCRIPTION'
					} ]
				} ).promise();
			} );

			var ve = new wb.queryService.ui.visualEditor.VisualEditor( api );
			ve.setQuery( testCase.sparqlIn );

			var $html = $( '<div>' );
			ve.draw( $html );

			assert.equal( ve.getQuery().trim(), testCase.sparqlOut );
			assert.equal( $html.text().trim(), testCase.text );
		} );

	} );

}( jQuery, QUnit, sinon, wikibase ) );
