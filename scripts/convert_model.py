#!/usr/bin/env python3
"""
Converts a Keras model to TensorFlow.js format for use with @tensorflow/tfjs-node
"""

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TF warnings

import tensorflow as tf
import json

def convert_keras_to_tfjs(keras_path, output_dir):
    """Convert Keras model to TensorFlow.js format"""
    
    # Load the Keras model
    print(f"Loading Keras model from: {keras_path}")
    model = tf.keras.models.load_model(keras_path)
    
    print("\nModel Summary:")
    model.summary()
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Get weights directly
    print("\nExtracting model weights...")
    weights = model.get_weights()
    
    # Save weights as binary
    weight_data = []
    for w in weights:
        weight_data.extend(w.flatten().tolist())
    
    import struct
    with open(os.path.join(output_dir, 'group1-shard1of1.bin'), 'wb') as f:
        for value in weight_data:
            f.write(struct.pack('f', value))
    
    # Create model.json manifest
    model_json = {
        "format": "layers-model",
        "generatedBy": "keras v3",
        "convertedBy": "manual conversion",
        "modelTopology": {
            "keras_version": tf.keras.__version__,
            "backend": "tensorflow",
            "model_config": json.loads(model.to_json()),
            "training_config": None
        },
        "weightsManifest": [{
            "paths": ["group1-shard1of1.bin"],
            "weights": []
        }]
    }
    
    # Build weight specs
    for i, (w, layer) in enumerate(zip(weights, model.layers)):
        weight_specs = []
        layer_weights = layer.get_weights()
        for j, lw in enumerate(layer_weights):
            weight_name = f"{layer.name}/{'kernel' if j == 0 else 'bias'}:0"
            weight_specs.append({
                "name": weight_name,
                "shape": list(lw.shape),
                "dtype": "float32"
            })
        model_json["weightsManifest"][0]["weights"].extend(weight_specs)
    
    # Save model.json
    with open(os.path.join(output_dir, 'model.json'), 'w') as f:
        json.dump(model_json, f, indent=2)
    
    print(f"\nConversion successful!")
    print(f"  Output directory: {output_dir}")
    print(f"  Files created: model.json, group1-shard1of1.bin")
    
    return output_dir

if __name__ == "__main__":
    keras_model_path = "./model.keras"
    output_directory = "./model"
    
    convert_keras_to_tfjs(keras_model_path, output_directory)
