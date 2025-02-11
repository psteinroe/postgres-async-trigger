# Postgres Async Triggers
Run asynchronous side-effects on database events.

At hellomateo, we rely heavily on Supabase. And like any SaaS, we need to execute side-effects like sending a Webhook after a record changed. At first, we manually created database triggers that inserted jobs into the Postgres-based queue Graphile Worker after insert/update/delete. At some point though, we hit scalability issues: the fetch job query from graphile worker dominated our database load, and the maxed out workers weren’t able to process jobs fast enough during peak times.

As an intermediary solution, we forwarded the critical jobs from graphile worker to QStash. This helped with the maxed out workers at the cost of higher latency. As a messaging solution, higher latency is bad though. But still, things stabilised for the time being which gave us time to find a better solution.

We wanted to solve not only the scalability issues, but also improve DX. We wanted to reduce the surface area to write business logic. It should be easy to test and implement. Something that promotes functional programming.

## Exploring Change Data Capture

First, we looked into more scalable solutions to get events out of the database. The obvious option is Change Data Capture (CDC). CDC is a Postgres feature that allows us to subscribe to any change happening in the database. It’s almost instant, and without overhead. But it’s a complex beast. To better understand the protocol, I created a quick proof of concept in Rust for a pipeline that batches the events before sending them to to a HTTP endpoint. While feasible, there are a lot of things to take care of, and we did not want to take on that extra complexity.

Next, we looked for tools that do the job for us. There is X, which provides an Elixir module to implement async triggers. Thats great, but we want to keep using Typescript. During that time, I also talked to the guys at Sequin. I was very excited, because it seemed like the perfect fit. But they are very young, and were just getting started with their cloud offering. Self-hosting is an option, but with no Elixir experience on the team risky. I also did not like their DX. I want the developer to define triggers in the code, and Sequin requires you to use their Dashboard or Terraform. There are of course other tools like Debezium, but their operational complexity is way too high. We decided that while CDC can be a great solution further down the road, its complexity is not justified yet.

Side Note: At this point, we also became jealous on frameworks like Rails, where such side effects are baked in. It served us as an inspiration when we implement our own little framework.

## The Simple Solution is Good Enough

We took a step back, and began tinkering on improving what we already have (and know well):  How can we reduce the database load and reduce latency without compromising on horizontal scability?

First, QStash had to be replaced. A HTTP based queue will always introduce latency we cannot afford. We quickly decided on BullMQ, because we were already using Redis for caching and it’s a battle-proven queuing system with low double digit latency.

Now to the fun part: how to reduce the database load from graphile worker while increasing throughput? The only option is to start batching jobs. We have tables that trigger a lot of side effects, and each job was inserted from its own database trigger.

SHOW EXAMPLE TRIGGER

We did a quick proof of concept and the results were promising. But we are not there yet. The database triggers are boilerplate, and we do not want to require a new migration every time we implement a side-effect anymore.

## Implementing Async Triggers

The core idea of async triggers is to bootstrap the DDL for the database triggers that check the conditions for each subscription and insert a batch job. The developer declares an async trigger using a simple DSL that is very similar to its equivalent in SQL.

SHOW DSL

Any async trigger declares up to three subscriptions on a table: insert, update and delete. Unlike database triggers, each subscription has its own optional WHEN clause to filter on old and new. We also enforce the selection of columns to reduce the payload size. The execute function receives a typed event payload as well as globally declared dependencies. All functions are registered on the server and collected on startup of the service. Before we start processing jobs, a set_subscriptions function is called that merges all subscriptions into a database table.

The DDL for the subscriptions table looks like this:

SHOW DDL

The subscription table itself has a trigger that fires after insert, update and delete to sync the database triggers. It dynamically generates and executes the create function and create trigger statements. Lets break it down.

EXPLAIN TRIGGER

The final job payload looks like this:

SHOW PAYLOAD AND EXPLAIN

Graphile worker now simply forwards the job to BullMQ. We use this canary release that implements local queues to maximise throughput and reduce database load at a theoretical latency cost. But we found that due to our single-digit job processing time and with at least two parallel workers, the downsides are negligible.

## Summary

And that’s it for the async triggers! We successfully reduced the load on our database and increased throughput by batching the export jobs and thanks to the local queue mode. The latency is very low too: the BullMQ worker is executed in less than 100ms after the transaction completes on the database. We are also happy with the DX. A new developer should be able to implement business logic quickly. And the best part: we are still using only the simple tools.

## Future Work

Right now, the framework is published as a shadcn-style demo. It is meant as a starting point for others to build their own. At some point, I hope to make this a more generic solution, where graphile worker and BullMQ are just adapters for a generic „transport layer“. I would also love to see a variant that uses only Supabase infrastructure:
- `pg_net` to get the jobs out of the database
- `pg_mq` as the queue
- edge functions to execute the jobs
We didn’t go this path because at that time queues were not released yet, we don’t use edge functions yet, and this architecture would not fulfil our throughput and latency requirements. Still, it is a viable option for many.

## Additional Goodies

This blog post focussed on the async trigger implementation only. But the framework you can find in the demo repository is capable of more. We implemented an abstraction layer on top of BullMQ that allows for a boilerplate-free and type-safe implementation of business logic in a very functional manner. Functions can call, trigger and schedule other functions, and every handler receives globally defined dependencies that are created from the environment in a type-safe way. There is also a test framework to test both triggers and functions. Although a lot of things can still be polished, we are happy with its current status and hope it’s already of value for the community.

If you want to help build this, we are hiring in Berlin! You can reach me on philipp@hellomateo.de.
