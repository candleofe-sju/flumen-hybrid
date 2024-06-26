/************************************************************************
 * Copyright 2024 - EUGENTIA, All Rights Reserved
 *
 * Project: flumen
 *
 * Description: flumen is a language for building semantic models
 * and expressing rules that capture additional domain knowledge.
 *
 * This software is distributed "AS-IS" without ANY WARRANTIES
 * and licensed under the Eclipse Public License - v 1.0
 * which is available at http://www.eclipse.org/org/documents/epl-v10.php
 *
 ***********************************************************************/

grammar flumen;

// Parser

flumenModel
	: 'uri' baseUri=STRING ('alias' alias=ID)? ('version' version=STRING)?
		(annotations+=flumenAnnotation)* EOS
		(imports+=flumenImport)*
		(elements+=flumenModelElement EOS)*
	;

addition
	: left=multiplication (op=opAdd right+=multiplication)*
	;

anArticle
	: indefiniteArticle
	| definiteArticle
	;

andExpression
	: left=equalityExpression (op=opAnd right+=equalityExpression)*
	;

anyNumber
	: floatingLiteral
	| integerLiteral
	;

askExpression
	: 'ask'	'where'	whereExpression=expression
	;

booleanValue
	: 'true'
	| 'false'
	;

cardinalityValue
	: DecimalLiteral
	| 'one'
	;

constants
	: 'PI'
	| 'known'
	| 'e'
	| '--'
	| 'None'
	| 'a'? 'type'
	| definiteArticle? 'length'
	| 'count'
	| definiteArticle? 'index'
	| ('first'
	| 'last'
	| anArticle ordinal?) 'element'
	| 'value'
	;

constructExpression
	: 'construct' subj=flumenResource ','? pred=flumenResource ','? obj=flumenResource 'where' whereExpression=expression
	;

declaration
	: article=anArticle ordinal? type=flumenPrimaryTypeReference
	    ('[' arglist+=expression? (',' arglist+=expression)* ']'
	    | 'length' len=facetNumber ('-' (maxlen=facetNumber | '*'))?)?
	;

definiteArticle
	: 'The'
	| 'the'
	;

elementInList
	: element=unitExpression
	| 'element' (before='before' | after='after')? element=unitExpression
	;

endWriteStatement
	: '}' 'to' filename=STRING
	;

equationSignature
	: name=flumenResource (annotations+=namedStructureAnnotation)* '(' (parameter+=flumenParameterDeclaration (',' paramater+=flumenParameterDeclaration)*)? ')'
		('returns' returnType+=flumenReturnDeclaration (',' returnType+=flumenReturnDeclaration)*)? ':'
	;

equalityExpression
	: left=relationalExpression (op=infixOperator right+=relationalExpression)*
	;

equationStatement
	: 'Equation' equationSignature
		(body=expression)?
		('return' retval=expression)?
		('where' where=expression)?
	;

explainStatement
	: 'Explain:' (expr=expression | 'Rule' ruleName=flumenResource)
	;

expression
	: 'select' distinct='distinct'?
		('*' | selectFrom+=flumenResource (','? selectFrom+=flumenResource)*)
		'where' whereExpression=expressionParameterized (orderby='order' 'by' orderList+=orderElement (','? orderList+=orderElement)*)?
	| expressionParameterized
	;

expressionParameterized
	: sublist
	| orExpression
	;

expressionStatement
	: 'Expr:' expr=expression ('=>' evaluatesTo=STRING)?
	;

externalEquationStatement
	: 'External' equationSignature
		uri=STRING
		('located' 'at' location=STRING)?
		('where' where=expression)?
	;

facetNumber
	: anyNumber
	;

facetValue
	: STRING
	| facetNumber
	;

floatingLiteral
	: FloatingLiteral
	;

flumenAllValuesCondition
	: 'only' ('has' | 'with') 'values' 'of' 'type' type=flumenPrimaryTypeReference facet=flumenDataTypeFacet?
	;

flumenAnnotation
	: ','? '(' type=('alias' | 'note' | 'see') contents+=STRING (',' contents+=STRING)* ')'
	;

flumenArticleStatement
	: anArticle flumenUnionType (flumenInstance | flumenNecessaryAndSufficient)
	;

flumenCanOnlyBeOneOf
	: 'can' 'only' 'be' 'one' 'of' '{' values+=flumenExplicitValue (',' values+=flumenExplicitValue)* '}'
	;

flumenCardinalityCondition
	: ('has' | 'with')
		('at' operator=('least' | 'most') | exactly='exactly')?
		cardinality=cardinalityValue ('value' | 'values')
		('of' 'type' type=flumenPrimaryTypeReference facet=flumenDataTypeFacet?)?
	;

flumenClassOrPropertyDeclaration
	: '{' classOrProperty+=flumenResource (',' classOrProperty+=flumenResource)* '}' multipleResource='are'
	    (('top-level'? 'classes' | (oftype='types' | oftype='instances') 'of' superElement=flumenPrimaryTypeReference) describedBy+=flumenPropertyDeclaration*
	        | flumenDisjointClassTypes
	        | flumenDifferent
	    )
	;

flumenClassOrPropertyDeclarationClass
	: flumenTopProperty
	| flumenProperty
	| flumenRestriction
	| flumenSameAs
	| flumenDifferentFrom
	| flumenInstanceDef
	| flumenDisjointClass
	;

flumenCondition
	: flumenAllValuesCondition
	| flumenHasValueCondition
	| flumenCardinalityCondition
	;

flumenDataType
	: 'string'
	| 'boolean'
	| 'decimal'
	| 'int'
	| 'long'
	| 'float'
	| 'double'
	| 'duration'
	| 'dateTime'
	| 'time'
	| 'date'
	| 'gYearMonth'
	| 'gYear'
	| 'gMonthDay'
	| 'gDay'
	| 'gMonth'
	| 'hexBinary'
	| 'base64Binary'
	| 'anyURI'
	| 'integer'
	| 'negativeInteger'
	| 'nonNegativeInteger'
	| 'positiveInteger'
	| 'nonPositiveInteger'
	| 'byte'
	| 'unsignedByte'
	| 'unsignedInt'
	| 'anySimpleType'
	;

flumenDataTypeFacet
	: ('(' | minInclusive='[') min=facetNumber? ',' max=facetNumber? (maxInclusive=']' | ')')
	| regex=STRING
	| 'length' (len=facetNumber | minlen=facetNumber '-' (maxlen=facetNumber | '*'))
	| '{' values+=facetValue (','? values+=facetValue)* '}'
	;

flumenDefaultValue
	: 'has' ('level' level=DecimalLiteral)? 'default' defValue=flumenExplicitValue
	;

flumenDifferent
	: (complement='not')? 'the' 'same'
	;

flumenDifferentFrom
	: 'is' 'not' 'the' 'same' 'as' notTheSameAs=flumenUnionType
	;

flumenDisjointClass
	: ('and' classes+=flumenResource)+ 'are' 'disjoint'
	;

flumenDisjointClassTypes
	: 'disjoint'
	;

flumenExplicitValue
	: operator=('-' | 'not')? value=flumenExplicitValueLiteral
	;

flumenExplicitValueLiteral
	: resourceLiteral=flumenResource
	| numberLiteral=anyNumber (unit)?
	| stringLiteral=STRING
	| booleanLiteral=booleanValue
	| valueLiteral=flumenValueList
	| constantLiteral=('PI' | 'e' | 'known')
	;

flumenHasPropertyInitializer
	: ','? firstConnective=('with' | 'has')? property=qNAME (value=flumenExplicitValue | '(' instance=flumenNestedInstance ')')
	;

flumenHasValueCondition
	: 'always' ('has' | 'with') 'value' (restriction=flumenExplicitValue | '(' instance=flumenNestedInstance ')')
	;

flumenImport
	: 'import' importedResource=STRING ('as' alias=ID)? EOS
	;

flumenInstance
	: instance=flumenResource? propertyInitializers+=flumenPropertyInitializer*
	;

flumenInstanceDef
	: ('is' anArticle type=flumenUnionType)? (listInitializer=flumenValueList | propertyInitializers+=flumenPropertyInitializer+)?
	;

flumenIntersectionType
	: left=flumenPrimaryTypeReference ('and' right+=flumenPrimaryTypeReference)*
	;

flumenIsAnnotation
	: 'is' 'a' 'type' 'of' annotation='annotation'
	;

flumenIsFunctional
	: 'has' 'a' single='single' (inverse='subject' | 'value')?
	;

flumenIsInverseOf
	: 'is' 'the' 'inverse' 'of' otherProperty=qNAME
	;

flumenIsPropertyInitializer
	: ','? firstConnective='is' property=qNAME 'of' type=qNAME
	;

flumenIsSymmetrical
	: 'is' symmetrical='symmetrical'
	;

flumenIsTransitive
	: 'is' transitive='transitive'
	;

flumenModelElement
	: writeStatement
	| flumenStatement
	| expressionStatement
	| ruleStatement
	| queryStatement
	| updateStatement
	| testStatement
	| printStatement
	| readStatement
	| explainStatement
	| equationStatement
	| externalEquationStatement
	;

flumenMustBeOneOf
	: 'must' 'be' 'one' 'of' '{' values+=flumenExplicitValue (',' values+=flumenExplicitValue)* '}'
	;

flumenName
	: name=qNAME (function='(' arglist+=expression? (',' arglist+=expression)* ')')?
	;

flumenNecessaryAndSufficient
	: 'is' anArticle object=flumenResource (ifCond='if' 'and')? 'only' 'if' propConditions+=flumenPropertyCondition ('and' propConditions+=flumenPropertyCondition)*
	;

flumenNestedInstance
	: instance=flumenResource 'is' article=anArticle type=flumenUnionType propertyInitializers+=flumenPropertyInitializer*
	| article=anArticle type=flumenUnionType flumenInstance
	;

flumenOfPropertyInitializer
	: ','? firstConnective='of' property=qNAME 'is' (value=flumenExplicitValue | '(' instance=flumenNestedInstance ')')
	;

flumenParameterDeclaration
	: type=flumenPrimaryTypeReference (typeEllipsis='...')? name=flumenResource ('(' (augtype=expressionParameterized)? ('{' units+=unit (',' units+=unit)* '}')? ')')?
	| unknown='--'
	| ellipsis='...'
	;

flumenPrimitiveDataType
	: primitiveType=flumenDataType list='List'?
	;

flumenPrimaryTypeReference
	: flumenSimpleTypeReference
	| flumenPrimitiveDataType
	| flumenTableDeclaration
	| '(' flumenPropertyCondition ')'
	| '{' flumenUnionType '}'
	;

flumenPropertyCondition
	: qNAME cond=flumenCondition
	;

flumenPropertyDeclaration
	: ','? 'described' 'by' nameDeclaration=flumenResource restrictions+=flumenPropertyRestriction*
	;

flumenPropertyInitializer
	: flumenHasPropertyInitializer
	| flumenIsPropertyInitializer
	| flumenOfPropertyInitializer
	;

flumenProperty
	: 'is' 'a' 'property' (','? restrictions+=flumenPropertyRestriction)*
	;

flumenPropertyRestriction
	: flumenCondition
	| flumenTypeAssociation
	| flumenRangeRestriction
	| flumenIsInverseOf
	| flumenIsTransitive
	| flumenIsSymmetrical
	| flumenIsAnnotation
	| flumenDefaultValue
	| flumenIsFunctional
	| flumenMustBeOneOf
	| flumenCanOnlyBeOneOf
	;

flumenRangeRestriction
	: has=('has' | 'with') ('a' singleValued='single' 'value' | 'values')
	    'of' 'type' (typeonly=('class' | 'data')
	    | range=flumenPrimaryTypeReference facet=flumenDataTypeFacet?)
	;

flumenRelationshipProperty
	: anArticle? ('relationship' | 'Relationship') 'of' from=flumenUnionType 'to' to=flumenUnionType 'is' property=flumenResource
	;

flumenResource
	: name=qNAME annotations+=flumenAnnotation*
	;

flumenResourceClass
	: flumenResource flumenClassOrPropertyDeclarationClass
	;

flumenRestriction
	: (','? restrictions+=flumenPropertyRestriction)+
	;

flumenReturnDeclaration
	: type=flumenPrimaryTypeReference ('(' (augtype=expressionParameterized)? ('{' units+=unit (',' units+=unit)* '}')? ')')?
	| none='None'
	| unknown='--'
	;

flumenSameAs
	: 'is' 'the' 'same' 'as' (complement='not')? sameAs=flumenUnionType
	;

flumenSimpleTypeReference
	: type=qNAME list='List'?
	;

flumenStatement
	: flumenResourceClass
	| flumenClassOrPropertyDeclaration
	| flumenRelationshipProperty
	| flumenArticleStatement
	;

flumenTableDeclaration
	: 'table' '[' (parameter+=flumenParameterDeclaration (',' parameter+=flumenParameterDeclaration)*)? ']'
	    ('with' 'data' (table=valueTable | 'located' 'at' location=STRING))?
	;

flumenTopProperty
	: 'is' 'a' ('top-level'? 'class' | 'type' 'of' superElement=flumenPrimaryTypeReference (facet=flumenDataTypeFacet)?)
		(describedBy+=flumenPropertyDeclaration+ | (','? restrictions+=flumenPropertyRestriction)+)?
	;

flumenTypeAssociation
	: dmnkw=('describes' | 'of') domain=flumenUnionType
	;

flumenUnionType
	: left=flumenIntersectionType ('or' right+=flumenIntersectionType)*
	;

flumenValueList
	: '[' (explicitValues+=flumenExplicitValue (',' explicitValues+=flumenExplicitValue)*)? ']'
	;

indefiniteArticle
	: 'A'
	| 'a'
	| 'An'
	| 'an'
	| 'any'
	| 'some'
	| 'another'
	;

infixOperator
	: '=='
	| '!='
	| '='
	| 'is' ('not'? 'unique' 'in' | 'the'? 'same' 'as' | 'different' 'from')?
	| 'contains'
	| 'does' 'not' 'contain'
	;

integerLiteral: Signpart? (DecimalLiteral | '0');

multiplication
	: left=power (op=opMulti right+=power)*
	;

namedStructureAnnotation
	: ','? '(' type=flumenResource contents+=flumenExplicitValue (',' contents+=flumenExplicitValue)* ')'
	;

opAdd
	: '+'
	| '-'
	;

opAnd
	: ('and' | '&&')
	;

opCompare
	: '>='
	| '<='
	| '>'
	| '<'
	;

opOr
	: 'or'
	| '||'
	;

opMulti
	: '*'
	| '/'
	| '%'
	;

orderElement
	: ('asc' | desc='desc')? orderBy=flumenResource
	;

orExpression
	: left=andExpression (op=opOr right+=andExpression)*
	;

ordinal
	: 'first'
	| 'second'
	| 'other'
	| 'third'
	| 'fourth'
	| 'fifth'
	| 'sixth'
	| 'seventh'
	| 'eighth'
	| 'ninth'
	| 'tenth'
	;

power
	: left=propOfSubject ('^' right+=propOfSubject)*
	;

primaryExpression
	: '(' expression ')'
	| flumenName
	| declaration
	| stringLiteral=STRING
	| numberLiteral=anyNumber
	| booleanLiteral=booleanValue
	| constantLiteral=constants
	| valueLiteral=valueTable
	;

printStatement
	: 'Print:' (displayString=STRING | model='Deductions' | model='Model')
	;

propOfSubject
	: left=elementInList (of=('of' | 'for' | 'in') propOfSubject | (statement+=propOfSubjectStatement)+)?
	;

propOfSubjectStatement
	: (comma=',')? ('with' | 'has') prop=flumenResource (element=elementInList)?
	;

qNAME
	: QNAME_TERMINAL
	| ID
	;

queryStatement
	: start=('Ask' | 'Graph') ((name=flumenResource (annotations+=namedStructureAnnotation)*)? ':'
		queryStatementExpression (':' '[' parameterizedValues=valueRow ']')?
		| srname=flumenResource)
	;

queryStatementExpression
	: constructExpression
	| askExpression
	| expression
	;

readStatement
	: 'Read:' 'data' 'from' filename=STRING ('using' templateFilename=STRING)?
	;

relationalExpression
	: left=addition (op=opCompare right+=addition)*
	;

ruleStatement
	: ('Stage' stage=DecimalLiteral)? 'Rule' name=flumenResource (annotations+=namedStructureAnnotation)* ':'?
		('given' ifs+=expression)?
		('if' ifs+=expression)?
		'then' (then=expression | there=thereExistsStatement)
	;

startWriteStatement
	: write='Write:' (dataOnly='data')? '{'
	;

sublist
	: article=anArticle? 'sublist' 'of' list=orExpression 'matching' where=orExpression
	;

testStatement
	: 'Test:' test=expression
	;

thereExistsStatement
	: 'there' 'exists' match=expression ('plus' plus=expression)?
	;

unit
	: STRING
	| ID
	;

unaryExpression
	: expr=primaryExpression
	| op=('not' | '!' | 'only' | '-') expr=primaryExpression
	;

unitExpression
	: unaryExpression (unit_=STRING)?
	;

unsignedIntegerLiteral: DecimalLiteral | '0';

updateExpression
	: ('delete' dData='data'? deleteExpression=expression)?
		('insert' iData='data'? insertExpression=expression)?
		('where' whereExpression=expression)?
	;

updateStatement
	: 'Update' ((name=flumenResource annotations+=namedStructureAnnotation*)? ':' (updateExpression | expression)
		| name=flumenResource)
	;

valueRow
	: explicitValues+=expression (',' explicitValues+=expression)*
	;

valueTable
	: '[' row=valueRow ']'
	| '{' '[' rows+=valueRow ']' (','? '[' rows+=valueRow ']')* '}'
	;

writeStatement
	:  startWriteStatement expression endWriteStatement
	;

// Lexer

fragment DIGIT: [0-9];

fragment E: [eE];

fragment Exponentpart: E SIGN? Digitsequence;

fragment Fractionalconstant: Digitsequence? '.' Digitsequence;

fragment NONZERODIGIT: [1-9];

fragment SIGN: [+-];

DecimalLiteral: NONZERODIGIT DIGIT*;

Digitsequence: DIGIT ('\''? DIGIT)*;

EOS: '.';

EXPONENT: E SIGN? DecimalLiteral;

FloatingLiteral
	: SIGN? Fractionalconstant Exponentpart?
	| SIGN? Digitsequence Exponentpart
	;

ID: '^'? ('a'..'z' | 'A'..'Z' | '_') ('a'..'z' | 'A'..'Z' | '_' | '0'..'9' | '-' | '%' | '~')*;

ML_COMMENT: '/*' .*? '*/' -> skip;

QNAME_TERMINAL: ID ':' ID;

Signpart: SIGN;

SL_COMMENT: '//' ~[\r\n]* -> skip;

STRING
	: '"'  ('\\' ('b' | 't' | 'n' | 'f' | 'r' | 'u' | '"' | '\'' | '\\') | ~('\\' | '"' ))* '"'
	| '\'' ('\\' ('b' | 't' | 'n' | 'f' | 'r' | 'u' | '"' | '\'' | '\\') | ~('\\' | '\''))* '\''
	;

WS: ('\u00A0' | ' ' | '\t' | '\r' | '\n')+ -> skip;
