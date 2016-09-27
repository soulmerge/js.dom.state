.. image:: https://raw.githubusercontent.com/score-framework/py.doc/master/docs/score-banner.png
    :target: http://score-framework.org

`The SCORE Framework`_ is a collection of harmonized python and javascript
libraries for the development of large scale web projects. Powered by strg.at_.

.. _The SCORE Framework: http://score-framework.org
.. _strg.at: http://strg.at


*****************
score.dom.theater
*****************

.. _js_dom_theater:

This module implements a very simple DOM management engine in Javascript. All
examples in this documentation will refer to the following example scenario,
where you can edit bloggers and articles on the same page without reloading the
page::

    <div id="main"> <!-- the stage -->
        <div id="blogger"> <!-- a scene -->
            <form>
                <input name="name"/>
                <select name="origin"></select>
            </form>
        </div>
        <div id="article"> <!-- another scene -->
            <form>
                <input name="title"/>
                <textarea name="text"></textarea>
            </form>
        </div>
    </div>

A *stage* is a prominent DOM node that can present various *scenes*.

A *scene* is one of multiple user interfaces on a given stage.

Initialization
==============

All scenes managed by this module have a stage object, which holds a number
of scenes. The stage object makes sure that only one object is active at a
time and calls all appropriate functions on the scene objects::

    var stage = new score.dom.theater.Stage(score.dom('#main'));

After defining a stage, you can create specific scenes for it::

    var bloggerScene = new score.dom.theater.Scene(stage, 'blogger', document.getElementById('blogger'));

The scenes can then be activated through the stage object, or the individual
objects. The following lines are thus equivalent::

    stage.show('blogger');
    /* is the same as */
    stage.show(bloggerScene);
    /* is the same as */
    bloggerScene.show();

Configuration
=============

The scenes have various functions, which will be called automatically by
the stage.

_init
-----

Will be called just once to initialize the scene. This routine might
fetch any data from the server that is a.) not expected to change during the
runtime and b.) not related to any specific data that might be rendered. This
function must return a promise object, if it performs an asynchronous
operation.

Example for our user editor::

    bloggerScene._init = function() {
        var country = this.node.find('select[name="origin"]');
        return score.ajax('/list/countries', function(data) {
            data = JSON.parse(data);
            for (var i = 0; i < data.length; i++) {
                var option = document.createElement('option');
                option.setAttribute('value', data[i][0]);
                option.textContent = data[i][1];
                country.appendChild(option);
            }
        });
    };

_load
-----

This function will be called when the scene is expected to display a new
data set. All arguments to the ``show()``-Function will be passed here as
well.

Example for our user editor::

    bloggerScene._show = function(id) {
        var self = this;
        return score.ajax('/data/user?id=' + id, function(data) {
            self.data = JSON.parse(data);
            self.data.changed = false;
            self.node.find('input[name="name"]')[0].value = self.data.name;
        });
    };

Our modified code needs a different call to ``show()``. If we wanted to load
the editor for the user with the id 15, we could call either of the following::

    stage.show('blogger', 15);
    /* is the same as */
    stage.show(bloggerScene, 15);
    /* is the same as */
    bloggerScene.show(15);

_activate
---------

This function is called whenever the scene needs to be rendered. This is
the intended place for the scene to verify its integrity or check other
constraints before being shown. This function does not receive any parameters.

Example for our user editor::

    bloggerScene._activate = function() {
        if (this.data.changed) {
            this.data.changed = false;
            this.node.find('input[name="name"]')[0].value = data.name;
        }
    };

_deactivate
-----------

This function is called when the scene is replaced by another scene,
i.e. whenever the user navigates to a different scene in the same stage.

Example for our user editor::

    bloggerScene._deactivate = function() {
        if (this.data.changed && askIfStore()) {
            this.store();
            this.data.changed = false;
        }
    };

Events
======

The scene objects support events for each of the above function
definitions:

- ``init``
- ``load``
- ``activate``
- ``deactivate``


Acknowledgments
===============

Many thanks to BrowserStack_ and `Travis CI`_ for providing automated tests for
our open source projects! We wouldn't be able to maintain our high quality
standards without them!

.. _BrowserStack: https://www.browserstack.com
.. _Travis CI: https://travis-ci.org/


License
=======

Copyright © 2015,2016 STRG.AT GmbH, Vienna, Austria

All files in and beneath this directory are part of The SCORE Framework.
The SCORE Framework and all its parts are free software: you can redistribute
them and/or modify them under the terms of the GNU Lesser General Public
License version 3 as published by the Free Software Foundation which is in the
file named COPYING.LESSER.txt.

The SCORE Framework and all its parts are distributed without any WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. For more details see the GNU Lesser General Public License.

If you have not received a copy of the GNU Lesser General Public License see
http://www.gnu.org/licenses/.

The License-Agreement realised between you as Licensee and STRG.AT GmbH as
Licenser including the issue of its valid conclusion and its pre- and
post-contractual effects is governed by the laws of Austria. Any disputes
concerning this License-Agreement including the issue of its valid conclusion
and its pre- and post-contractual effects are exclusively decided by the
competent court, in whose district STRG.AT GmbH has its registered seat, at the
discretion of STRG.AT GmbH also the competent court, in whose district the
Licensee has his registered seat, an establishment or assets.
