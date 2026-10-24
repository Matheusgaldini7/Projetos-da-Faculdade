import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class NewPokemonScreen extends StatefulWidget {
  const NewPokemonScreen({super.key});

  @override
  State<NewPokemonScreen> createState() => _NewPokemonScreenState();
}

class _NewPokemonScreenState extends State<NewPokemonScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _spriteController = TextEditingController();
  final _levelController = TextEditingController();

  final _spriteFocus = FocusNode();
  final _levelFocus = FocusNode();

  String _preview = '';
  String? _type;

  final types = [
    'Fogo','Água','Planta','Elétrico','Normal','Psíquico','Gelo','Dragão'
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _spriteController.dispose();
    _levelController.dispose();
    _spriteFocus.dispose();
    _levelFocus.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    await FirebaseFirestore.instance.collection('pokemons').add({
      'name': _nameController.text.trim(),
      'spriteId': int.parse(_spriteController.text),
      'level': int.parse(_levelController.text),
      'types': [_type],
    });

    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Novo Pokémon')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          autovalidateMode: AutovalidateMode.onUserInteraction,
          child: Column(
            children: [
              if (_preview.isNotEmpty)
                Text('Cadastrando: $_preview...'),

              const SizedBox(height: 12),

              TextFormField(
                controller: _nameController,
                textInputAction: TextInputAction.next,
                onChanged: (v) => setState(() => _preview = v.trim()),
                onFieldSubmitted: (_) => _spriteFocus.requestFocus(),
                decoration: const InputDecoration(
                  labelText: 'Nome',
                  border: OutlineInputBorder(),
                ),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Obrigatório';
                  if (v.length < 2) return 'Min 2 caracteres';
                  return null;
                },
              ),

              const SizedBox(height: 10),

              TextFormField(
                controller: _spriteController,
                focusNode: _spriteFocus,
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.next,
                onFieldSubmitted: (_) => _levelFocus.requestFocus(),
                decoration: const InputDecoration(
                  labelText: 'Sprite ID',
                  border: OutlineInputBorder(),
                ),
                validator: (v) {
                  final n = int.tryParse(v ?? '');
                  if (n == null) return 'Número inválido';
                  if (n < 1 || n > 1025) return '1-1025';
                  return null;
                },
              ),

              const SizedBox(height: 10),

              TextFormField(
                controller: _levelController,
                focusNode: _levelFocus,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Nível',
                  border: OutlineInputBorder(),
                ),
                validator: (v) {
                  final n = int.tryParse(v ?? '');
                  if (n == null) return 'Número inválido';
                  if (n < 1 || n > 100) return '1-100';
                  return null;
                },
              ),

              const SizedBox(height: 10),

              DropdownButtonFormField<String>(
                initialValue: _type,
                items: types
                    .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                    .toList(),
                onChanged: (v) => setState(() => _type = v),
                decoration: const InputDecoration(
                  labelText: 'Tipo',
                  border: OutlineInputBorder(),
                ),
                validator: (v) => v == null ? 'Selecione' : null,
              ),

              const SizedBox(height: 16),

              ElevatedButton(
                onPressed: _save,
                child: const Text('Salvar'),
              )
            ],
          ),
        ),
      ),
    );
  }
}