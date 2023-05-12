# Repairing Indexed Data

## Forks and Missed Blocks

After version 3.3.9-5, Hyperion includes a tool to repair indexed data. This tool can be used to fix any unlinked
block (forked)
or missed blocks in the indexer. Usually forks are handled by the indexer itself, but there was an issue with the
state-history plugin in the past, that caused fork events to be omitted during live indexing.
For cases like that and others, this tool can be used to fix the data and check integrity.

### 1. Test the connection

Use the following command to test the connection to the indexer:

```shell
./hyp-repair connect --host "ws://127.0.0.1:7002"
```

7002 is the default port for the indexer control websocket, which can be configured on the connections.json file
under `chains -> YOUR_CHAIN -> control_port`.

!!! success "Connection successful"
    If the connection is successful, you should see the following output:

    ```shell
    ✅  Hyperion Indexer Online - ws://127.0.0.1:7002
    ```

### 2. Scan

Scan for forks or missing blocks

```shell
./hyp-repair scan local
# Specify a range
./hyp-repair scan local --first 1000000 --last 2000000
# Specify the output pathname
./hyp-repair scan local -o ./local
```

If you don't specify a range, the scan will start in reverse, from the last indexed block until the first block in
Elasticsearch.
And if no output path is specified, the scan will be saved in the `.repair` folder.

### 3. Verify the saved scan file

```shell
# Example, your file name may be different
./hyp-repair view .repair/local-4-25334-missing-blocks.json
```

### 4. Request

##### 4.1. Missing blocks

Request the indexer to fill the **missing blocks**:

```shell
# Example, your file name may be different
./hyp-repair fill-missing local .repair/local-4-25334-missing-blocks.json
```

<br>

##### 4.2. Forked blocks

In the case of **forked blocks** (blocks that were indexed but are not linked to the previous block), you can use:

```shell
# Dry-run first to check the proposed removals
./hyp-repair repair local .repair/local-4-25334-forked-blocks.json --dry

# If everything looks good, run the repair
./hyp-repair repair local .repair/local-4-25334-forked-blocks.json
```

**`hyp-repair repair`** will first remove the forked blocks and the corresponding actions, deltas and state tables. Then
it will request the indexer to fill the missing blocks.

!!! success "Verify the results"
    Once the repair is completed, you can run the scan again to verify that there are no more missing blocks or forks.

<br>
