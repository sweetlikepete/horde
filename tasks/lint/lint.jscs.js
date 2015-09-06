

/* ------------------------------------------------------------------------ */
/*
        tasks.lint.jscs
*/
/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */
/*
        dependencies
*/
/* ------------------------------------------------------------------------ */


var utils = require("./../../utils/utils.js");


/* ------------------------------------------------------------------------ */
/*
        config
*/
/* ------------------------------------------------------------------------ */


var config = {
    "disallowDanglingUnderscores" : true,
    "disallowEmptyBlocks" : true,
    "disallowFunctionDeclarations" : true,
    "disallowMixedSpacesAndTabs" : true,
    "disallowMultipleVarDecl" : true,
    "disallowNewlineBeforeBlockStatements" : true,
    "disallowOperatorBeforeLineBreak" : ["."],
    "disallowQuotedKeysInObjects" : "allButReserved",
    "disallowSpaceAfterKeywords" : [
        "if",
        "for",
        "while",
        "do",
        "switch",
        "try",
        "catch",
        "function"
    ],
    "disallowSpaceAfterPrefixUnaryOperators" : ["++", "--", "~", "!"],
    "disallowSpaceBeforeBlockStatements" : true,
    "disallowSpaceBeforeKeywords" : [
        "else",
        "catch"
    ],
    "disallowSpaceBeforePostfixUnaryOperators" : ["++", "--"],
    "disallowSpacesInAnonymousFunctionExpression" : {
        "beforeOpeningRoundBrace" : true,
        "beforeOpeningCurlyBrace" : true
    },
    "disallowSpacesInCallExpression" : true,
    "disallowSpacesInFunctionDeclaration" : {
        "beforeOpeningRoundBrace" : true,
        "beforeOpeningCurlyBrace" : true
    },
    "disallowSpacesInFunctionExpression" : {
        "beforeOpeningRoundBrace" : true,
        "beforeOpeningCurlyBrace" : true
    },
    "disallowSpacesInFunction" : {
        "beforeOpeningRoundBrace" : true,
        "beforeOpeningCurlyBrace" : true
    },
    "disallowSpacesInNamedFunctionExpression" : {
        "beforeOpeningRoundBrace" : true,
        "beforeOpeningCurlyBrace" : true
    },
    "disallowSpacesInsideArrayBrackets" : "all",
    "disallowSpacesInsideBrackets" : true,
    "disallowSpacesInsideParentheses" : true,
    "disallowTrailingComma" : true,
    "disallowTrailingWhitespace" : true,
    "disallowYodaConditions" : true,
    "maximumLineLength" : 300,
    "maximumNumberOfLines" : 3000,
    "requireBlocksOnNewline" : true,
    "requireCapitalizedConstructors" : true,
    "requireCommaBeforeLineBreak" : true,
    "requireCurlyBraces" : [
        "if",
        "else",
        "for",
        "while",
        "do",
        "try",
        "catch",
        "case",
        "default"
    ],
    "requireLineBreakAfterVariableAssignment" : true,
    "requireOperatorBeforeLineBreak" : [
        "?",
        "=",
        "+",
        "-",
        "/",
        "*",
        "==",
        "===",
        "!=",
        "!==",
        ">",
        ">=",
        "<",
        "<="
    ],
    "requirePaddingNewLineAfterVariableDeclaration" : true,
    "requirePaddingNewLinesAfterUseStrict" : true,
    "requirePaddingNewlinesBeforeKeywords" : [
        "do",
        "for",
        "if",
        "switch",
        "case",
        "try",
        "void",
        "while",
        "with",
        "return",
        "function"
    ],
    "requirePaddingNewLinesBeforeExport" : true,
    "requirePaddingNewLinesBeforeLineComments" : true,
    "requirePaddingNewlinesInBlocks" : 1,
    "requireParenthesesAroundIIFE" : true,
    "requireSemicolons" : true,
    "requireSpaceAfterBinaryOperators" : [
        "=",
        "+",
        ",",
        "-",
        "/",
        "*",
        "==",
        "===",
        "!=",
        "!=="
    ],
    "requireSpaceAfterLineComment" : true,
    "requireSpaceAfterObjectKeys" : true,
    "requireSpaceBeforeBinaryOperators" : [
        "=",
        "+",
        "-",
        "/",
        "*",
        "==",
        "===",
        "!=",
        "!=="
    ],
    "requireSpaceBeforeObjectValues" : true,
    "requireSpaceBetweenArguments" : true,
    "requireSpacesInConditionalExpression" : {
        "afterTest" : true,
        "beforeConsequent" : true,
        "afterConsequent" : true,
        "beforeAlternate" : true
    },
    "requireSpacesInForStatement" : true,
    "requireSpacesInsideObjectBrackets" : "all",
    "safeContextKeyword" : ["self"],
    "validateIndentation" : 4,
    "validateLineBreaks" : "LF",
    "validateNewlineAfterArrayElements" : {
        "maximum" : 3
    },
    "validateParameterSeparator" : ", ",
    "validateQuoteMarks" : "\""
};


/* ------------------------------------------------------------------------ */
/*
        module
*/
/* ------------------------------------------------------------------------ */


module.exports = function(paths, options){

    paths = paths || [];

    options = utils.extend(config, options);

    files = utils.files.expand(paths);
    files = utils.cache.filter(files, "lint", "jscs");

    return new Promise(function(resolve, reject){

        if(!files || files.length === 0){
            return resolve();
        }

        var grunt = require("grunt");
        var JSCS = require("jscs");
        var fs = require("fs");

        var jscs = new JSCS();
        var errors = [];

        jscs.registerDefaultRules();
        jscs.configure(options);

        var processJSCS = function(files, index){

            index = index || 0;

            if(files[index]){

                var next = function(){

                    if(files[index + 1]){

                        processJSCS(files, index + 1);

                    }else{

                        if(utils.validate.code(errors, "JSCS")){

                            utils.cache.set(files, "lint", "jscs");

                            resolve();

                        }

                    }

                };

                var code = fs.readFileSync(files[index], "utf8");

                jscs.checkFile(files[index]).then(function(errs){

                    if(errs){

                        errs = errs["_errorList"];

                        for(var i = 0; i < errs.length; i++){

                            errors.push({
                                character : errs[i].column + 3,
                                reason : errs[i].message,
                                line : errs[i].line,
                                file : files[index],
                                description : "",
                                code : code
                            });

                        }

                    }

                    next();

                }, function(){ console.log("WTF"); });

            }

        };

        processJSCS(files);

    });

}
