# Interface System Form Control Note

This note supplements the reusable component registry for the Plan form refinement approved on 27 September 2026.

`SelectField` remains the shared select boundary and now normalises browser presentation so field height, Manrope typography, padding and focus treatment match the rest of the Interface System.

`TextField type="date"` remains the public date-field usage contract. The component now presents the governed Revision calendar treatment rather than relying on the browser's differently sized date-popup UI. Application state continues to receive ISO `YYYY-MM-DD` values, while learners see `DD / MM / YYYY` and can either type the date or choose it from the shared calendar.

This is an implementation refinement of the existing common-control rule, not a new product capability or a separate design system.
