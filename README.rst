score.tpl
=========

This module implements a very simple templating engine in Javascript. All
examples in this documentation will refer to the following example
scenario::

    <div id="main">
        <div id="customer">
            <form>
                <input name="name"/>
                <select name="origin"></select>
            </form>
        </div>
    </div>

Initialization
--------------

All templates managed by this module have a root object, which holds a number
of templates. The root object makes sure that only one object is active at a
time and calls all appropriate functions on the template objects::

    var root = new tpl.root(document.getElementById('main'));

After defining such a root object, you can create specific templates beneath
this root::

    var customertpl = new tpl.Template(root, 'customer', document.getElementById('customer'));

The templates can then be activated through the root object, or the individual
objects. The following two lines are thus equivalent::

    root.show('customer');
    /* is the same as */
    root.show(customertpl);
    /* is the same as */
    customertpl.show();

Configuration
-------------

The templates have various functions, which will be called automatically by
the root.

_init
`````

Will be called just once to initialize the template. This routine might
fetch any data from the server that is a.) not expected to change during the
runtime and b.) not related to any specific data that might be rendered. This
function must return a promise object, if it performs an asynchronous
operation.

Example for our user editor::

    customertpl._init = function() {
        var country = this.node.querySelector('select[name="origin"]');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', encodeURI('/list/countries'));
        xhr.onload = function() {
            if (xhr.status !== 200) {
                // handle error
            };
            var data = JSON.parse(xhr.responseText);
            for (var i = 0; i < data.length; i++) {
                var option = document.createElement('option');
                option.setAttribute('value', data[i][0]);
                option.innerText = data[i][1];
                country.appendChild(option);
            }
        };
        xhr.send();
    };

_load
`````

This function will be called when the template is expected to display a new
data set. All arguments to the ``show()``-Function will be passed here as
well.

Example for our user editor::

    customertpl._show = function(id) {
        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', encodeURI('/data/user?id=' + id));
        xhr.onload = function() {
            if (xhr.status !== 200) {
                // handle error
            };
            self.data = JSON.parse(xhr.responseText);
            self.data.changed = false;
            self.node.querySelector('input[name="name"]').value = self.data.name;
        });
        xhr.send();
    };

Our modified code needs a different call to ``show()``. If we wanted to load
the editor for the user with the id 15, we could call either of the following::

    root.show('customer', 15);
    /* is the same as */
    root.show(customertpl, 15);
    /* is the same as */
    customertpl.show(15);

_activate
`````````

This function is called whenever the template needs to be rendered. This is
the intended place for the template to verify its integrity or check other
constraints before being shown. This function does not receive any parameters.

Example for our user editor::

    customertpl._activate = function() {
        if (this.data.changed) {
            this.data.changed = false;
            this.node.querySelector('input[name="name"]').value = data.name;
        }
    };

_deactivate
```````````

This function is called when the template is replaced by another template,
i.e. whenever the user navigates to a different template in the same root.

Example for our user editor::

    customertpl._deactivate = function() {
        if (this.data.changed && askIfStore()) {
            this.store();
            this.data.changed = false;
        }
    };

Events
------

The template objects support events for each of the above function
definitions:

- ``init``
- ``load``
- ``activate``
- ``deactivate``
