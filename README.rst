.. image:: https://raw.githubusercontent.com/score-framework/py.doc/master/docs/score-banner.png
    :target: http://score-framework.org

`The SCORE Framework`_ is a collection of harmonized python and javascript
libraries for the development of large scale web projects. Powered by strg.at_.

.. _The SCORE Framework: http://score-framework.org
.. _strg.at: http://strg.at


***************
score.dom.state
***************

.. _js_dom_state:

.. image:: https://travis-ci.org/score-framework/js.dom.state.svg?branch=master
    :target: https://travis-ci.org/score-framework/js.dom.state

This module implements a state machine for the DOM. When properly applied, this
approach can provide rudimentary solutions for a vast range of use cases. Some
examples include: 

- accordions
- menus
- tabs

Quickstart
==========

Note: You can read this quickstart along with its fiddle_.

.. _fiddle: https://jsfiddle.net/fjektzrv/

Let's create an accordion containing a delicious menu:

.. code-block:: html

    <div id="menu">
        <div id="starters">
            <h1>Starters</h1>
            <ul class="state-content">
                <li>moules marinieres</li>
                <li>pate de foie gras</li>
                <li>beluga caviar</li>
                <li>eggs Benedictine</li>
                <li>tart de poireaux</li>
                <li>frogs' legs amandine</li>
                <li>oeufs de caille Richard Shepherd</li>
            </ul>
        </div>
        <div id="cheese">
            <h1>Cheese</h1>
            <ul class="state-content">
                <li>Red Windsor</li>
                <li>Stilton</li>
                <li>Gruyere</li>
                <li>Emmental</li>
                <li>Norwegian Jarlsberger</li>
                <li>Liptauer</li>
                <li>Lancashire</li>
                <li>White Stilton</li>
                <li>Danish Blue</li>
            </ul>
        </div>
        <div id="dessert">
            <h1>Dessert</h1>
            <ul class="state-content">
                <li>wafer-thin mint</li>
            </ul>
        </div>
    </div>

We will first need to create a group for the states of the menu:

.. code-block:: javascript

    var menu = new score.dom.state.Group(score.dom('#menu'));

This will add the CSS class ``score-state-group`` to the top-most ``#menu``
node. We can now create a state for each tab:

.. code-block:: javascript

    menu.defineState('starters', score.dom('#starters'));
    menu.defineState('cheese', score.dom('#cheese'));
    menu.defineState('dessert', score.dom('#dessert'));

Each state node now has the additional CSS class ``score-state``. The group
will now make sure, that at any given time, at most one of these states is
active. The active state will additionaly receive the class
``score-state--active``. Let's show the starters:

.. code-block:: javascript

    menu.show('starters');

The DOM now looks like this:

.. code-block:: html

    <div id="menu" class="score-state-group score-state-group--starters">
        <div id="starters" class="score-state score-state--active">
            ...
        </div>
        <div id="cheese" class="score-state">
            ...
        </div>
        <div id="dessert" class="score-state">
            ...
        </div>
    </div>

If we now switch to the cheese section (``menu.show('cheese')``), the DOM will
instead look like the following:

.. code-block:: html

    <div id="menu" class="score-state-group score-state-group--cheese">
        <div id="starters" class="score-state">
            ...
        </div>
        <div id="cheese" class="score-state score-state--active">
            ...
        </div>
        <div id="dessert" class="score-state">
            ...
        </div>
    </div>

The example just needs a bit of styling to work:

.. code-block:: css

    #menu .state-content {
        display: none;
    }

    #menu .score-state--active .state-content {
        display: block;
    }

Details
=======

State Objects
-------------

The examples in the Quickstart section use a simplified API, where states are
defined with a function call on the group itself:

.. code-block:: javascript

    var state = menu.defineState('starters', score.dom('#starters'));

This call actually creates a new State object and returns it. It is equivalent
to the following:

.. code-block:: javascript

    var state = new score.dom.state.State(menu, 'starters', score.dom('#starters'));

This is important to know, as it is possible to tweak a state's behaviour, as
we will see in the next few sections.


State Transitions
-----------------

Whenever a state group is ordered to load a certain state, it will perform a
multi-step transitions from the active state to the requested state:

- *Initialize* the new state if it's loaded for the first time.
- *Deactivate* the current state (if there is one).
- *Activate* the requested state.

State objects have a function for each of these operations: ``_init``,
``_activate`` and ``_deactivate``. It is possible to create sub-classes of the
State class to perform some tasks at these points:

.. code-block:: javascript

    var CheeseState = score.oop.Class({
        __name__: 'CheeseState',
        __parent__: score.dom.state.State,

        _activate: function(self) {
            alert("Sorry, we're out of cheese");
        }

    });

These functions may also return Promises, in which case the state transition is
delayed until the promise is complete:

.. code-block:: javascript

    var StartersState = score.oop.Class({
        __name__: 'StartersState',
        __parent__: score.dom.state.State,

        _deactivate: function(self) {
            // whoa, better eat up!
            return new Promise(function(resolve, reject) {
                window.setTimeout(resolve, 3600 * 1000);
            });
        }
    });

The state above takes a full hour to deactivate, in which time the menu will
refuse to perform any other state transitions (since a very long-lasting one is
already in progress).

The Initialization can be used to perform some heavy-duty operations only when
they are necessary (i.e. when the state is actually relevant). Loading the main
courses asynchronously might look likethe following:

.. code-block:: javascript

    var MainCoursesState = score.oop.Class({
        __name__: 'MainCoursesState',
        __parent__: score.dom.state.State,

        _init: function(self) {
            return score.ajax('/main-courses').then(function(courses) {
                var list = self.node.find('.state-content');
                courses.forEach(function(course) {
                    list.append(score.dom.create('li').text(course));
                });
            });
        }
    });

Events
------

The state objects support events for each of the above function definitions:

.. code-block:: javascript

    menu.states.cheese.on('init', function() {
        // TODO: compile list of excuses
    });

    menu.states.dessert.on('deactivate', function() {
        // this handler may return false to indicate
        // that the transition should be canceled.
        console.log("Customer has died");
        return false;
    });

The most important difference between the events and the specific methods is
that events follow the usual rules of the score.oop module, which means that
all event listeners need to be synchronous.


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
