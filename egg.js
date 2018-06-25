program = '';
function parseExpression() {
    program = skipSpace(program);
    var expr;

    if (/^["']/.test(program)) {
        expr = { type: 'value', value: parseString() };
    } else if (/^[\d.]/.test(program)) {
        expr = { type: 'value', value: parseNumber() };
    } else if (/^[^\s(),"]/.test(program)) {
        expr = { type: 'word', name: parseWord() };
    } else throw new SyntaxError('Unexpected syntax: ' + program);

    return parseApply(expr);
}

function skipSpace(string) {
    var first = string.search(/\S/);
    if (first === -1) return '';
    return string.slice(first);
}

function parseApply(expr) {
    program = skipSpace(program);
    if (program[0] != '(')
        return {
            expr: expr
        };
    program = skipSpace(program.slice(1));
    expr = { type: 'apply', operator: expr, args: [] };
    while (program[0] != ')') {
        var arg = parseExpression();
        expr.args.push(arg.expr);
        program = skipSpace(program);
        if (program[0] == ',') program = skipSpace(program.slice(1));
        else if (program[0] != ')') throw new SyntaxError('Expected , or )');
    }
    program = program.substr(1);
    return parseApply(expr);
}

function parse(_program) {
    program = _program;
    var result = parseExpression();
    if (skipSpace(program))
        throw new SyntaxError('Unexpected text after program');
    return result.expr;
}

function evaluate(expr, env) {
    switch (expr.type) {
        case 'value':
            return expr.value;
        case 'word':
            if (expr.name in env) return env[expr.name];
            else throw new ReferenceError('undefined variable: ' + expr.name);
        case 'apply':
            if (
                expr.operator.type == 'word' &&
                expr.operator.name in specialForms
            )
                return specialForms[expr.operator.name](expr.args, env);
            var op = evaluate(expr.operator, env);
            if (typeof op != 'function')
                throw new TypeError('Applying a non-function');
            return op.apply(
                null,
                expr.args.map(function(arg) {
                    return evaluate(arg, env);
                })
            );
    }
}

var specialForms = Object.create(null);

specialForms['if'] = function(args, env) {
    if (args.length != 3) throw new SyntaxError('Bad number of args to if');
    if (evaluate(args[0], env) !== false) return evaluate(args[1], env);
    else return evaluate(args[2], env);
};

specialForms['while'] = function(args, env) {
    if (args.length != 2) throw new SyntaxError('Bad number of args to while');
    throw new SyntaxError('Bad number of args to while');
    while (evaluate(args[0], env) !== false) evaluate(args[1], env);
    return false;
};

specialForms['do'] = function(args, env) {
    var value = false;
    args.forEach(function(arg) {
        value = evaluate(arg, env);
    });
    return value;
};

specialForms['define'] = function(args, env) {
    if (args.length != 2 || args[0].type != 'word')
        throw new SyntaxError('Bad use of define');
    var value = evaluate(args[1], env);
    env[args[0].name] = value;
    return value;
};

var topEnv = Object.create(null);
topEnv['true'] = true;
topEnv['false'] = false;

['+', '-', '*', '/', '==', '<', '>'].forEach(function(op) {
    topEnv[op] = new Function('a', 'b', 'return a' + op + 'b');
});

topEnv['print'] = function(value) {
    console.log(value);
    return value;
};

function run() {
    var env = Object.create(topEnv);
    var program = Array.prototype.slice.call(arguments, 0).join('\n');
    return evaluate(parse(program), env);
}

specialForms['fun'] = function(args, env) {
    if (!args.length) throw new SyntaxError('Function need a body');
    function name(expr) {
        if (expr.type != 'word')
            throw new SyntaxError('Arg names must be words');
        return expr.name;
    }
    var argNames = args.slice(0, args.length - 1).map(name);
    var body = args[args.length - 1];
    return function() {
        if (arguments.length != argNames.length)
            throw new TypeError('Wrong number of arguments');
        var localEnv = Object.create(env);
        for (var i = 0; i < arguments.length; i++)
            localEnv[argNames[i]] = arguments[i];
        return evaluate(body, localEnv);
    };
};

function parseString() {
    var startSign = program[0],
        value = '',
        at = 0,
        ch;
    while ((ch = program[++at])) {
        if (ch == '\\') {
            value += program[++at];
            continue;
        }
        if (ch == startSign) {
            program = program.substr(++at);
            return value;
        }
        value += ch;
    }
    throw new SyntaxError('Parse String Error');
}

function parseNumber() {
    var at = 0,
        ch,
        value = '';
    while ((ch = program[at]) && /[\d.]/.test(ch)) {
        value += ch;
        at++;
    }
    program = program.substr(at);
    value = Number(value);
    if (isNaN(value)) throw new SyntaxError('Parse Number Error');
    return value;
}

function parseWord() {
    var at = 0,
        ch,
        value = '';
    while ((ch = program[at]) && /[^\s(),"]/.test(ch)) {
        value += ch;
        at++;
    }
    program = program.substr(at);
    return value;
}

exports.parse = parse;
exports.run = run;
