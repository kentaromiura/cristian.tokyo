Writing this blog
=================

This post is being built while I'm in the phase of building this blog from scratch in ReasonML.

I believe each blog entry shouldn't take more than 3 minutes to read, 
so I'll split this post accordingly.
For texts longer than 3 minutes I'll add an article section in the future.

Design decisions
----------------

Apart for the decision of using Reason there are a couple of choice I want to take:

- For the UI part I've decided to use hyperHTML as I think it's more functional than React (I'll write more about this in the future)
- I want to reuse the redux pattern
- The blog shpuld be mobile first
- The blog should be server side render, ideally it should work without JavaScript, this doesn't mean we cannot use JavaScript for enhancing the experience (eg: pre-fetching articles and avoid full page reloads)
- The main article will be written in Markdown, I'll use reddit markdown.

