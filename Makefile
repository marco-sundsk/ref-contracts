RFLAGS="-C link-arg=-s"

test-issue: build-exchange mock-ft mock-rated
	RUSTFLAGS=$(RFLAGS) cargo test -p ref-exchange --lib test_immunefi -- --nocapture

build-exchange: ref-exchange
	rustup target add wasm32-unknown-unknown
	RUSTFLAGS=$(RFLAGS) cargo build -p ref-exchange --target wasm32-unknown-unknown --release
	mkdir -p res
	cp target/wasm32-unknown-unknown/release/ref_exchange.wasm ./res/ref_exchange.wasm

test: test-exchange

test-exchange: build-exchange mock-ft mock-rated
	RUSTFLAGS=$(RFLAGS) cargo test -p ref-exchange 

mock-ft: test-token
	rustup target add wasm32-unknown-unknown
	RUSTFLAGS=$(RFLAGS) cargo build -p test-token --target wasm32-unknown-unknown --release
	mkdir -p res
	cp target/wasm32-unknown-unknown/release/test_token.wasm ./res/test_token.wasm

mock-rated: test-rated-token
	rustup target add wasm32-unknown-unknown
	RUSTFLAGS=$(RFLAGS) cargo build -p test-rated-token --target wasm32-unknown-unknown --release
	mkdir -p res
	cp target/wasm32-unknown-unknown/release/test_rated_token.wasm ./res/test_rated_token.wasm

clean:
	cargo clean

