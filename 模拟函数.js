var main = function(main) {
    var stack = [
        {
            main: main
        }
    ];
    var funcNameStack = [];
    function log(key) {
        console.log(
            'func: ',
            funcNameStack[funcNameStack.length - 1],
            get(key)
        );
    }
    function call(value) {
        var env = {};
        stack.push(env);
        funcNameStack.push(value);
        get(value)(get, set, call, log);
        stack.pop();
        funcNameStack.pop(value);
    }

    function get(key) {
        for (var i = stack.length; i--; ) {
            if (key in stack[i]) {
                return stack[i][key];
            }
        }
        return undefined;
    }
    function set(key, value) {
        for (var i = length; i--; ) {
            if (key in stack[i]) {
                stack[i][key] = value;
                return value;
            }
        }
        stack[stack.length - 1][key] = value;
    }
    return call('main');
};

main(function(get, set, call, log) {
    set('a', 1);
    set('foo', function(get, set, call, log) {
        log('a');
        set('a', 2);
        set('b', 4);
        log('b');
        log('a');
    });
    call('foo');
    log('b');
    log('a');
});
