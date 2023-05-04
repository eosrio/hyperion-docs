

# Repairing Indexed Data
checking integrity, check for indexing errors

## Forks and Missed Blocks

test local indexer connection

```shell
./hyp-repair connect
```

test remote indexer connection

```shell
./hyp-repair connect --host ws://192.168.100.10:4321
```

scan for forks or lost blocks

```shell
./hyp-repair scan ultra-main
```

scan specific range

```shell
./hyp-repair scan ultra-main --first 1000000 --last 2000000
```
