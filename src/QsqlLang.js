import {languages} from 'monaco-editor'

const qsql= require('quick-ddl');

function parse_errors( input ) {
    var ret  = [];
    
    var lines = input.split("\n");
    
    if( lines.length < 5 || qsql.ddl == null )
        return ret;
    
    ret = ret.concat(line_mismatch(lines));
    qsql.ddl.translate(input);
    ret = ret.concat(ref_error(lines));

    return ret;
}

function line_mismatch( lines ) {
    var ret  = [];
    
    var indent = guessIndent( lines )
    
    for( var i = 1; i < lines.length; i++ ) {
        var priorline = lines[i-1];
        var line = lines[i];
        
        var priorIndent = apparentDepth(priorline);
        var lineIndent = apparentDepth(line);
        
        if( lineIndent == 0 )
            continue;
       
        if( priorIndent < lineIndent && lineIndent < priorIndent+indent )
            ret.push({
                        from: {line:i, ch:lineIndent,  },
                        to: {line:i, ch:lineIndent+1,  },
                        //severity: "error",
                        message: "Misaligned code. \nThe indent appears to be "+indent+" spaces."
            });
    }

    return ret;
}

function guessIndent( lines ) {    	
    var idents = [];
    
    var priorFullIndent = -1;
    var priorRelativeIndents = [];
    
    for( var i = 0; i < lines.length; i++ ) {
        var line = lines[i];
        if( "\n" == line )
            continue;
        
        var ident = apparentDepth(line);
        
        if( priorFullIndent == -1 ) {
            priorFullIndent = ident;
            priorRelativeIndents.push(ident);
            continue;
        }
        var index = ident - priorFullIndent;
        if( index == 0 ) {
            var tmp = priorRelativeIndents[priorRelativeIndents.length-1];
            if( tmp != 0 )
                index = tmp;
        }
        if( index < 0 ) {
            index = -index;
            priorRelativeIndents.length--;
        } else {
            if( priorFullIndent < ident)
                priorRelativeIndents.push(index);
        }
        if( index != 0 ) {
            if( idents[index] == null )
                idents[index] = 0;
            idents[index]++;
        }           
        priorFullIndent = ident;
    }
    var ret = 1;
    var cmp = idents[ret];
    if( cmp == null )
        cmp = 0;
    for( var i = 1; i < idents.length; i++ ) {
        if( cmp < idents[i] ) {
            ret = i;
            cmp = idents[i];
        }
    }
    return ret;
}

function apparentDepth( line ) {
    var chunks = line.split(/ |\t/);
    var offset = 0;
    for( var j = 0; j < chunks.length; j++ ) {
        var chunk = chunks[j]/*.intern()*/;
        //if( "\t" == chunk )
            //TODO;
        if( "" == chunk  ) {
            offset++;
            continue;
        }
        if( !/[^.a-zA-Z0-9_"]/.test(chunk) ) 
            return offset;
    }
    return 0;
}

function ref_error( lines ) {
    var ret  = [];
    
    for( var i = 0; i < qsql.ddl.forest.length; i++ ) {
    	var node = qsql.ddl.forest[i];
        var nodeUpperContent = node.trimmedContent().toUpperCase();
        if( node.parseType() == 'VIEW' ) {
            var chunks = nodeUpperContent.split(' ');
            for( var j = 2; j < chunks.length; j++ ) { 
                if( chunks[j].trim() == "" )
                    continue;
                if( 0 == chunks[j].indexOf("/") )
                    continue;
                var tbl = qsql.ddl.find(chunks[j]);
                if( tbl == null ) {
                    var pos = nodeUpperContent.indexOf(chunks[j]);
                    ret.push({
                        from: {line:node.x+1, ch:pos+1,  },
                        to: {line:node.x+1, ch:pos+chunks[j].length+1,  },
                        //severity: "error",
                        message: "Undefined object: "+chunks[j]
                    });
                }
           }
        }
    }
    
    for( var i = 0; i < lines.length; i++ ) {
        var line = lines[i];
        var lineUpperContent = line.toUpperCase();
        if( 0 < lineUpperContent.indexOf("/FK") ) {
            var chunks = lineUpperContent.split(' ');
            var refIsNext = false;
            for( var j = 1; j < chunks.length; j++ ) { 
                if( chunks[j].trim() == "" )
                    continue;
                if( chunks[j] == "/FK" ) {
                    refIsNext = true;
                    continue;
                }
                if( !refIsNext )
                    continue;
                var tbl = qsql.ddl.find(chunks[j]);
                if(  tbl == null ) {
                    var pos = lineUpperContent.indexOf(chunks[j]);
                    ret.push({
                        from: {line:i+1, ch:pos+1,  },
                        to: {line:i+1, ch:pos+chunks[j].length+1,  },
                        //severity: "error",
                        message: "Undefined object: "+chunks[j]
                    });                   
                    break;
                }
            }
        }
    }
    return ret;
}

function QsqlLang() {
    languages.register({
        id: "qsql"
    })

    const tmp = languages.getLanguages();

    languages.setMonarchTokensProvider('qsql', {
        ignoreCase: true,
        keywords: [
            'insert',
        ],
    
        operators: [
            '=',
            '>',
            '<',
            '!',
            '~',
            '?',
            ':',
            '==',
            '<=',
            '>=',
            '!=',
            '&&',
            '||',
            '++',
            '--',
            '+',
            '-',
            '*',
            '/',
            '&',
            '|',
            '^',
            '%',
            '<<',
            '>>',
            '>>>',
            '+=',
            '-=',
            '*=',
            '/=',
            '&=',
            '|=',
            '^=',
            '%=',
            '<<=',
            '>>=',
            '>>>='
        ],
    
        // we include these common regular expressions
        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
        digits: /\d+(_+\d+)*/,
        octaldigits: /[0-7]+(_+[0-7]+)*/,
        binarydigits: /[0-1]+(_+[0-1]+)*/,
        hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
    
        // The main tokenizer for our languages
        tokenizer: {
            root: [
                // Special keyword with a dash
                ['non-sealed', 'keyword.non-sealed'],
    
                // identifiers and keywords
                [
                    /[a-zA-Z_$][\w$]*/,
                    {
                        cases: {
                            '@keywords': { token: 'keyword.$0' },
                            '@default': 'identifier'
                        }
                    }
                ],
    
                // whitespace
                { include: '@whitespace' },
    
                // delimiters and operators
                [/[{}()\[\]]/, '@brackets'],
                [/[<>](?!@symbols)/, '@brackets'],
                [
                    /@symbols/,
                    {
                        cases: {
                            '@operators': 'delimiter',
                            '@default': ''
                        }
                    }
                ],
    
                // @ annotations.
                [/@\s*[a-zA-Z_\$][\w\$]*/, 'annotation'],
    
                // numbers
                [/(@digits)[eE]([\-+]?(@digits))?[fFdD]?/, 'number.float'],
                [/(@digits)\.(@digits)([eE][\-+]?(@digits))?[fFdD]?/, 'number.float'],
                [/0[xX](@hexdigits)[Ll]?/, 'number.hex'],
                [/0(@octaldigits)[Ll]?/, 'number.octal'],
                [/0[bB](@binarydigits)[Ll]?/, 'number.binary'],
                [/(@digits)[fFdD]/, 'number.float'],
                [/(@digits)[lL]?/, 'number'],
    
                // delimiter: after number because of .\d floats
                [/[;,.]/, 'delimiter'],
    
                // strings
                [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
                [/"""/, 'string', '@multistring'],
                [/"/, 'string', '@string'],
    
                // characters
                [/'[^\\']'/, 'string'],
                [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
                [/'/, 'string.invalid']
            ],
    
            whitespace: [
                [/[ \t\r\n]+/, ''],
                [/\/\*\*(?!\/)/, 'comment.doc', '@javadoc'],
                [/\/\*/, 'comment', '@comment'],
                [/\/\/.*$/, 'comment']
            ],
    
            comment: [
                [/[^\/*]+/, 'comment'],
                // [/\/\*/, 'comment', '@push' ],    // nested comment not allowed :-(
                // [/\/\*/,    'comment.invalid' ],    // this breaks block comments in the shape of /* //*/
                [/\*\//, 'comment', '@pop'],
                [/[\/*]/, 'comment']
            ],
            //Identical copy of comment above, except for the addition of .doc
            javadoc: [
                [/[^\/*]+/, 'comment.doc'],
                // [/\/\*/, 'comment.doc', '@push' ],    // nested comment not allowed :-(
                [/\/\*/, 'comment.doc.invalid'],
                [/\*\//, 'comment.doc', '@pop'],
                [/[\/*]/, 'comment.doc']
            ],
    
            string: [
                [/[^\\"]+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, 'string', '@pop']
            ],
    
        }
    });

}

export {parse_errors, QsqlLang};