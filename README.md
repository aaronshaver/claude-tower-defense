# AI still sucks.

I spent a couple hours today building a web browser tower defense game using Claude 3.7 Sonnet. It's supposed to be one the best AI models for code. (I even used Extended Thinking sometimes.)

The models are fine if your problem is highly familiar or highly constrained, like generating boiler plate, learning the basics of a new language, or small bug fixes.

But once you reach a certain project size and/or conversation length you run into problems:

* Constant "max message length", even when you split the project into separate files
* Forgetting instructions (like "no intro/outro, just code")
* Sometimes deciding to refactor or add features you never asked for
* Hallucination is still rampant (I used 3.7 Sonnet for a Unity project yesterday and it was completely making up menu options and features)
* Poor understanding of file versioning, file naming, file linking
* Zero intuitive understanding of abstract concepts that are easy for humans
* Code smells from laziness, like magic numbers

I don't know. There's days where I feel like we're still in the stochastic parrot stage of AI. I still don't get the sense there's any real intelligence or real creativity or even diligence / craftspersonship from these models.

If you pay attention, you'll notice many of the "OMG Claude one-shot a game!" hype posts on Twitter/YouTube are merely asking for output that has high representation in the models' training data (like a simple Mario clone). Or if it is a novel or sophisticated project, it'll be riddled with maintainability issues. Once you reach any kind of true novelty or larger project size, these models fall over hard.
