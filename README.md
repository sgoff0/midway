# MIDWAY

Test Armada Mocking Framework

For more information and getting started guide [OTTO Mocking introduction](http://testarmada.io/documentation/Mocking/rWeb/JAVASCRIPT/Getting%20Started)

# Fork Details

This fork has the following high level changes

- Built upon Hapi v20 instead of Hapi v16
  - This was the impetus of 99% of the changes to resolve `npm audit` high and critical issues.
- Combined Midway and Smocks
  - Both projects depend upon Hapi 16, Midway depends on Smocks, yet neither repo had been updated in years. Combining the two made upgrading simpler.
- Reworked session approach
  - The route based session is highly inefficient from a memory standpoint. Each route ia relatively large object, but not a huge deal if there are only a couple hundred routes. If you have 250 routes and add 2 sessions you'll end up with roughly 750 routes (routes \* # of sessions + routes). For a use case with dozens or more sessions it may take several minutes to load midway. Instead of duplicating routes for each session, the new approah uses a javascript key/value pair to map routes with a much smaller memory footprint.
